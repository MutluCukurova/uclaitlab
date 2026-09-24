# UCLAIT — UCL Analytics & AI for Learning Team

A static website (plain HTML/CSS/JS, no build step). Most content is **data-driven from
CSV files** in [`data/`](data/), so it can be updated by editing a spreadsheet rather
than touching HTML. A small script, `assets/content.js`, reads each CSV on page load and
builds the page.

## Editing content

Edit the CSV in `data/` (one row = one entry) and commit it:

| File | Feeds |
|---|---|
| `team.csv` | Team (`Location` column also drives `map.html`) |
| `news.csv` | News |
| `reading-club.csv` + `workshop.csv` | Reading Club / Workshop |
| `social.csv` | Social — termly events |
| `life-in-the-lab.csv` | Social — photo gallery |
| `important-dates.csv` | Home — important dates |
| `publications.csv` | Publications (auto-generated — see below) |

Notes: put images in the matching `images/` subfolder (`team/`, `news/`, `social/`) and
reference just the filename; filenames are **case-sensitive** on GitHub; save CSVs as
**CSV UTF-8**. Sections auto-sort by date, so row order doesn't matter.

## Preview locally

The CSV pages must be **served over http** (opening the files directly won't load the
CSVs). From this folder:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Deploy (GitHub Pages)

1. Push to a GitHub repo, then **Settings → Pages → Deploy from a branch → `main` /
   `(root)`**. Live at `https://<user>.github.io/<repo>/`.
2. **Settings → Actions → General → Workflow permissions → “Read and write”** so the
   publications job can commit its updates.

Paths are relative, so it works under the `…/<repo>/` subpath with no changes.

## Automation

- **Publications** (`data/publications.csv`) refresh **monthly** (1st of the month) via
  [.github/workflows/update-publications.yml](.github/workflows/update-publications.yml),
  pulling from [OpenAlex](https://openalex.org). Run on demand from the Actions tab, or
  locally: `python3 scripts/update_publications.py`.
- **Reading-club APA citations** (`data/reading-club.csv`, `apa` column) are generated
  from each paper's DOI/link via Crossref: `python3 scripts/update_reading_club.py`.

## Structure

```
*.html              pages (index, team, research, publications, news, reading-club, social)
map.html            standalone "team around the world" infographic (not linked from nav)
assets/             styles.css, main.js, content.js
data/               editable CSV content
images/             team/  news/  social/  research/  (+ shared logo in the root)
scripts/            update_publications.py, update_reading_club.py
.github/workflows/  update-publications.yml
```
