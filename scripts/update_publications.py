#!/usr/bin/env python3
"""
Auto-generate data/publications.csv from OpenAlex.

Pulls the most recent works for the lab's author(s), formats each as an APA-style
citation, splits them into "journal" vs "conference" (conference proceedings +
preprints), and writes them to data/publications.csv.

Run locally:   python3 scripts/update_publications.py
Runs weekly on GitHub Actions (see .github/workflows/update-publications.yml).

No API key needed. OpenAlex just asks for a contact email in the query (the
"polite pool") — set via the MAILTO env var or the default below.
"""
import csv, json, os, re, sys, urllib.parse, urllib.request

# --- Config -----------------------------------------------------------------
AUTHOR_IDS = ["A5010726815"]         # Mutlu Cukurova (UCL). Add more IDs to include co-leads.
MAX_ITEMS  = 40                      # how many recent works to show on the page
MAILTO     = os.environ.get("MAILTO", "m.cukurova@ucl.ac.uk")
OUT_PATH   = os.path.join(os.path.dirname(__file__), "..", "data", "publications.csv")

# OpenAlex work types we never want to list as publications.
SKIP_TYPES = {"dataset", "peer-review", "grant", "paratext", "editorial",
              "erratum", "retraction", "reference-entry", "report-component"}


def fetch_works(author_id):
    base = "https://api.openalex.org/works"
    params = {
        "filter": f"author.id:{author_id}",
        "sort": "publication_date:desc",
        "per-page": "200",
        "mailto": MAILTO,
    }
    url = base + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": f"UCLAIT-site ({MAILTO})"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)["results"]


def format_author(display_name):
    """'Mutlu Cukurova' -> 'Cukurova, M.'  ;  'Anna C. Falhs' -> 'Falhs, A. C.'"""
    parts = (display_name or "").split()
    if not parts:
        return ""
    if len(parts) == 1:
        return parts[0]
    surname = parts[-1]
    initials = " ".join(p[0].upper() + "." for p in parts[:-1] if p)
    return f"{surname}, {initials}"


def format_authors(authorships):
    names = [format_author(a["author"]["display_name"]) for a in authorships]
    names = [n for n in names if n]
    if not names:
        return ""
    if len(names) > 10:                       # trim very long author lists
        names = names[:10] + ["et al."]
    if len(names) == 1:
        return names[0]
    if names[-1] == "et al.":
        return ", ".join(names[:-1]) + ", et al."
    return ", ".join(names[:-1]) + ", & " + names[-1]


def clean_text(s):
    """Fix metadata artifacts: soft hyphens and spaced hard-hyphens from journals."""
    s = (s or "").replace("­", "")            # discretionary/soft hyphen
    s = re.sub(r"\s*[‐‑]\s*", "-", s)     # 'AI ‐Generated' -> 'AI-Generated'
    s = re.sub(r"\s+", " ", s).strip()
    return s


def clean_venue(v):
    v = clean_text(v)
    v = re.sub(r"\s*\(.*\)\s*$", "", v)             # 'arXiv (Cornell University)' -> 'arXiv'
    return v


def norm_title(t):
    return re.sub(r"[^a-z0-9]+", " ", clean_text(t).lower()).strip()


def esc(s):
    return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def categorise(w, source_type):
    t = w.get("type") or ""
    if t in ("preprint", "posted-content"):
        return "conference"                   # panel 2 = "Conference Proceedings & Preprints"
    if t == "proceedings-article" or source_type == "conference":
        return "conference"
    if t in ("article", "review", "letter") and source_type == "journal":
        return "journal"
    if t == "book-chapter":                   # LNCS/CCIS proceedings show up as chapters
        return "conference"
    return None                               # anything else: skip


def build_citation(w):
    authors = format_authors(w.get("authorships", []))
    year = w.get("publication_year") or ""
    title = esc(clean_text(w.get("title")).rstrip(". "))

    loc = w.get("primary_location") or {}
    source = loc.get("source") or {}
    venue = esc(clean_venue(source.get("display_name") or ""))

    bib = w.get("biblio") or {}
    vol, issue = bib.get("volume"), bib.get("issue")
    fp, lp = bib.get("first_page"), bib.get("last_page")
    pages = f"{fp}–{lp}" if fp and lp else (fp or "")

    doi = w.get("doi") or ""
    doi_link = ""
    if doi:
        short = doi.replace("https://doi.org/", "doi:")
        doi_link = f' <a href="{esc(doi)}" target="_blank" rel="noopener">{esc(short)}</a>'

    cite = f"{authors} ({year}). {title}. "
    if venue:
        if vol:
            cite += f"<em>{venue}, {esc(str(vol))}</em>"
            cite += f"({esc(str(issue))})" if issue else ""
            cite += f", {esc(str(pages))}" if pages else ""
            cite += "."
        else:
            cite += f"<em>{venue}</em>"
            cite += f", {esc(str(pages))}." if pages else "."
    cite += doi_link
    return cite.strip()


def main():
    seen, rows = set(), []
    for aid in AUTHOR_IDS:
        for w in fetch_works(aid):
            if (w.get("type") or "") in SKIP_TYPES:
                continue
            key = norm_title(w.get("title")) or (w.get("doi") or w.get("id") or "").lower()
            if not key or key in seen:      # collapse duplicate/version records by title
                continue
            source_type = ((w.get("primary_location") or {}).get("source") or {}).get("type") or ""
            cat = categorise(w, source_type)
            if not cat:
                continue
            seen.add(key)
            rows.append({"year": w.get("publication_year") or 0,
                         "type": cat,
                         "citation": build_citation(w)})

    rows.sort(key=lambda r: r["year"], reverse=True)
    rows = rows[:MAX_ITEMS]

    if not rows:
        sys.exit("No works returned — refusing to overwrite publications.csv with an empty list.")

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", newline="", encoding="utf-8") as f:
        wr = csv.writer(f)
        wr.writerow(["type", "year", "citation"])
        for r in rows:
            wr.writerow([r["type"], r["year"], r["citation"]])

    j = sum(1 for r in rows if r["type"] == "journal")
    print(f"Wrote {len(rows)} publications to data/publications.csv "
          f"({j} journal, {len(rows) - j} conference/preprint).")


if __name__ == "__main__":
    main()
