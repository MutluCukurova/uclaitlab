# UCLAIT — UCL Analytics & AI for Learning Team

A static website (plain HTML/CSS/JS — no build step, no framework). Most content is
**data-driven from CSV files** in [`data/`](data/), so it can be updated by editing a
spreadsheet rather than touching HTML.

- **Editing content:** see **[CONTENT-GUIDE.md](CONTENT-GUIDE.md)** — the full, friendly
  guide to every CSV (team, news, reading club/workshops, social, gallery, important
  dates, publications) and the image rules.

---

## Preview locally

The CSV-driven pages must be **served over http** — opening the `.html` files directly
(double-click / `file://`) will show empty sections because browsers block local file
reads that way.

- **Easiest:** double-click **`preview.command`** — it starts a small server and opens
  your browser. Keep its Terminal window open while previewing; close it to stop.
- **Manual:** from this folder run `python3 -m http.server 8000`, then open
  <http://localhost:8000>.

---

## Deploy to GitHub Pages

1. Create a repo on GitHub and push:
   ```bash
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```
2. **Settings → Pages → Source: "Deploy from a branch" → `main` / `(root)` → Save.**
   The site goes live at `https://<username>.github.io/<repo>/` within ~1 minute.
3. **Settings → Actions → General → Workflow permissions → "Read and write
   permissions" → Save.** (Lets the publications auto-update commit its changes — below.)

All asset paths are relative, so it works under the `…/<repo>/` subpath with no changes.

---

## Auto-updating & refresh scripts

- **Publications** (`data/publications.csv`) refresh **automatically every Monday** via a
  GitHub Action ([.github/workflows/update-publications.yml](.github/workflows/update-publications.yml)),
  which pulls the latest works from [OpenAlex](https://openalex.org) and splits them into
  journal vs conference/preprint. Run it on demand from the **Actions** tab → *Update
  publications* → **Run workflow**, or locally:
  ```bash
  python3 scripts/update_publications.py
  ```
- **Reading club APA citations** (`data/reading-club.csv`, the `apa` column) are generated
  from each paper's DOI/link via Crossref. After adding papers (`paper_title` +
  `paper_url`), run:
  ```bash
  python3 scripts/update_reading_club.py
  ```

Both scripts need Python 3 and internet access; no API keys.

---

## Project structure

```
index.html  team.html  research.html  publications.html
news.html   reading-club.html  social.html
assets/
  styles.css      design system (one shared stylesheet)
  main.js         nav, theme toggle, scroll reveal, tabs
  content.js      renders the CSV-driven sections
data/             the editable content (one row = one entry) — see CONTENT-GUIDE.md
  team.csv  news.csv  reading-club.csv  workshop.csv
  social.csv  life-in-the-lab.csv  important-dates.csv  publications.csv
images/           team/  news/  social/  (+ the shared logo in the root)
scripts/          update_publications.py  update_reading_club.py
.github/workflows/update-publications.yml
CONTENT-GUIDE.md  how to add/edit content
preview.command   double-click to preview locally
```

Photos not referenced by any CSV/page are kept locally in `_unused-photos/` (gitignored,
not deployed). HEIC files are gitignored — convert to JPG before referencing, since
browsers can't display HEIC.

---

## Images — quick rules

Put photos in the matching subfolder and reference **just the filename** in the CSV:
`team.csv → images/team/`, `news.csv → images/news/`, `social.csv` &
`life-in-the-lab.csv → images/social/`. Filenames are **case-sensitive on GitHub**, and
save CSVs as **CSV UTF-8**. Full details in [CONTENT-GUIDE.md](CONTENT-GUIDE.md).
