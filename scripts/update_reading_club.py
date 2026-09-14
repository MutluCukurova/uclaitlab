#!/usr/bin/env python3
"""
Enrich data/reading-club.csv with an APA-style citation for each paper.

For every row that has a paper_url, this resolves the paper's metadata from
Crossref (by DOI where possible, else by title search) and writes a formatted
APA citation — with the DOI as a clickable link — into an `apa` column.
Rows that can't be resolved fall back to the plain (linked) title, so nothing
is ever lost. Re-runnable any time:

    python3 scripts/update_reading_club.py

The reading-club page renders `apa` when present (see assets/content.js).
"""
import csv, json, os, re, sys, time, urllib.parse, urllib.request

CSV = os.path.join(os.path.dirname(__file__), "..", "data", "reading-club.csv")
MAILTO = os.environ.get("MAILTO", "m.cukurova@ucl.ac.uk")


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "UCLAIT-site (" + MAILTO + ")"})
    with urllib.request.urlopen(req, timeout=25) as r:
        return json.load(r)


def doi_from_url(url):
    m = re.search(r"10\.\d{4,9}/[^\s\"'<>?#]+", url)
    if m:
        return m.group(0).rstrip(".").rstrip("/")
    m = re.search(r"nature\.com/articles/([^/?#]+)", url)
    if m:
        return "10.1038/" + m.group(1)
    m = re.search(r"arxiv\.org/abs/([0-9.]+)", url)
    if m:
        return "10.48550/arXiv." + m.group(1)
    return None


def norm(s):
    return re.sub(r"[^a-z0-9]+", "", (s or "").lower())


def crossref_by_doi(doi):
    return get("https://api.crossref.org/works/" + urllib.parse.quote(doi) +
               "?mailto=" + MAILTO)["message"]


def crossref_by_title(title):
    q = get("https://api.crossref.org/works?rows=1&mailto=" + MAILTO +
            "&query.bibliographic=" + urllib.parse.quote(title))
    items = q["message"].get("items", [])
    if not items:
        return None
    cand = items[0]
    ct = (cand.get("title") or [""])[0]
    a, b = norm(ct), norm(title)
    if a and b and (a[:25] == b[:25] or a in b or b in a):   # close-enough match
        return cand
    return None


def esc(s):
    return (str(s) if s is not None else "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def fmt_authors(msg):
    auth = msg.get("author") or []
    names = []
    for a in auth:
        fam = a.get("family") or a.get("name") or ""
        giv = a.get("given") or ""
        inits = " ".join(p[0].upper() + "." for p in re.split(r"[ \-]+", giv) if p)
        names.append((fam + ", " + inits).strip().rstrip(",") if fam else giv)
    names = [n for n in names if n]
    if not names:
        return ""
    if len(names) > 20:
        names = names[:20] + ["et al."]
    if len(names) == 1:
        return names[0]
    if names[-1] == "et al.":
        return ", ".join(names[:-1]) + ", et al."
    return ", ".join(names[:-1]) + ", & " + names[-1]


def build_apa(msg):
    authors = fmt_authors(msg)
    year = ""
    for k in ("published", "published-print", "published-online", "issued"):
        dp = (msg.get(k) or {}).get("date-parts")
        if dp and dp[0] and dp[0][0]:
            year = dp[0][0]; break
    title = esc((msg.get("title") or [""])[0].rstrip(". "))
    venue = esc((msg.get("container-title") or [""])[0])
    vol, issue = msg.get("volume"), msg.get("issue")
    pages = msg.get("page")
    doi = msg.get("DOI")
    cite = authors + (" (" + str(year) + "). " if year else " ") + title + ". "
    if venue:
        cite += "<em>" + venue + "</em>"
        if vol:
            cite += ", " + esc(str(vol)) + ("(" + esc(str(issue)) + ")" if issue else "")
        if pages:
            cite += ", " + esc(str(pages))
        cite += ". "
    if doi:
        link = "https://doi.org/" + doi
        cite += '<a href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(link) + "</a>"
    return cite.strip()


def main():
    rows = list(csv.DictReader(open(CSV, encoding="utf-8")))
    fields = list(rows[0].keys()) if rows else []
    if "apa" not in fields:
        fields.append("apa")

    ok = fallback = 0
    for r in rows:
        url = (r.get("paper_url") or "").strip()
        title = (r.get("paper_title") or "").strip()
        if not url and not title:
            r["apa"] = ""                      # "to be announced" row
            continue
        msg = None
        if url:
            try:
                doi = doi_from_url(url)
                msg = crossref_by_doi(doi) if doi else crossref_by_title(title or url)
            except Exception:
                msg = None
            time.sleep(0.3)                    # be polite to Crossref
        if msg:
            r["apa"] = build_apa(msg); ok += 1
        else:                                   # fallback: linked title (or plain)
            r["apa"] = ('<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(title or url) + "</a>") if url else esc(title)
            fallback += 1

    with open(CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader(); w.writerows(rows)
    print("APA written: %d resolved via Crossref, %d fell back to the linked title." % (ok, fallback))


if __name__ == "__main__":
    main()
