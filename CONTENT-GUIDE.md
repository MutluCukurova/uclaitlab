# Content Guide — updating News, Reading Club, Social & Gallery

This site has **no CMS and no auto-update**. Publications, team, and research are
still hand-edited HTML. But four sections are now **data-driven from CSV files** in
the [`data/`](data/) folder, so an admin can add content by **adding one row to a
spreadsheet** — no HTML needed.

| Section | Edit this file | Page it feeds |
|---|---|---|
| Important dates | `data/important-dates.csv` | `index.html` (home) |
| Team members | `data/team.csv` | `team.html` |
| News feed | `data/news.csv` | `news.html` |
| Reading Club schedule | `data/reading-club.csv` | `reading-club.html` |
| Workshops | `data/workshop.csv` | `reading-club.html` (Workshops tab) |
| Social — termly events | `data/social.csv` | `social.html` |
| Social — "Life in the Lab" gallery | `data/life-in-the-lab.csv` | `social.html` (bottom) |
| Publications | `data/publications.csv` — **auto-generated, see §6** | `publications.html` |

A small script, [`assets/content.js`](assets/content.js), reads each CSV when the
page opens and builds the cards/rows automatically. **You never touch the HTML.**

---

## ⚠️ One important rule for previewing

Browsers block reading local `.csv` files when you open a page by **double-clicking
it** (a `file://` security restriction). So:

- **On the live hosted site (GitHub Pages / Netlify / UCL web space): it just works.** ✅
- **To preview on your own computer — easiest:** **double-click `preview.command`**
  in this folder. It starts the little server and opens your browser automatically.
  Keep the Terminal window it opens running while you preview; close it to stop.
- **Or run it manually** from the folder, then open the printed address:

  ```bash
  python3 -m http.server 8000
  ```
  Then visit <http://localhost:8000>.

  ⚠️ **Do not preview by double-clicking `index.html` / the `.html` files directly**
  (or via an editor's built-in preview). That opens them as `file://`, where the
  browser blocks the CSV files, so News, Reading Club and the Social gallery show up
  **empty**. Always preview through `preview.command` or the server address above.
  (Once the site is deployed to a real host, it is served over http automatically and
  this is never an issue.)

---

## How to edit a CSV

1. Open the file from `data/` in **Excel, Numbers, Google Sheets, or a text editor**.
   (Spreadsheet apps handle the columns and quoting for you — this is the easy way.)
2. **Add a new row**, fill the columns (see each section below).
3. Save as **CSV (comma-separated)**, keeping the same filename.
4. Upload/commit the changed CSV (and any new images) to the site. Done.

**Quoting rule (only matters if you edit as plain text):** if a cell contains a
comma, a quote, or a link, wrap the whole cell in double quotes `"…"`. To put a
literal `"` inside, double it (`""`). Spreadsheet apps do this automatically on save.

**⚠️ Save as "CSV UTF-8".** When saving from Excel, choose **"CSV UTF-8
(Comma-delimited)"**, not plain "CSV". Plain CSV (especially on Mac) can save accents,
apostrophes and dashes (`ç`, `’`, `–`, Turkish `ı`) in an old encoding that shows up on
the website as `�`. UTF-8 keeps them correct.

---

## 0a. Important dates (home page) — `data/important-dates.csv`

The "Important dates" box on the home page. Columns: `event, date`

| Column | Required | What to put |
|---|---|---|
| `event` | yes | The conference/deadline name, e.g. `EC-TEL 2026` or `LAK2026 — paper submission deadline`. |
| `date` | yes | The date text as you want it shown, e.g. `16–20 September 2026`. |

Rows appear in file order. Add/remove/reorder rows to update the box.

```csv
event,date
AIED 2026,27 Jun–03 July
EC-TEL 2026,16–20 September 2026
```

---

## 0. Team — `data/team.csv`

Columns: `group, name, url, role, tag, image`

| Column | Required | What to put |
|---|---|---|
| `group` | yes | The section heading a member appears under, e.g. `Director`, `Affiliated Faculty Members`, `Postdoctoral Researchers`, `PhD Researchers`, `Alumni`. Members with the same `group` are shown together, and groups appear in the order they first show up in the file. |
| `name` | yes | The person's name. |
| `url` | no | Profile link (Scholar, UCL profile, etc.). If blank, the name shows as plain text. |
| `role` | no | Their role line, e.g. `PhD Researcher`. |
| `tag` | no | The short research-topic tag under the role. |
| `image` | yes | Photo filename in **`images/team/`** (just the filename). |

**To add a member:** add a row with the right `group`. **To create a new group:** just
use a new `group` name — a heading for it appears automatically.

```csv
group,name,url,role,tag,image
PhD Researchers,Jane Doe,https://scholar.google.com/...,PhD Researcher,Multimodal learning analytics,jane.jpg
```

---

## 1. News — `data/news.csv`

Columns: `date, venue, category, title, body, link_url, link_text, image`

| Column | Required | What to put |
|---|---|---|
| `date` | yes | Short date shown in the meta line, e.g. `Jul-26`. |
| `venue` | no | Place/context shown next to the date, e.g. `Seoul, Korea` or `Online`. |
| `category` | no | A small label above the title, e.g. `conference`, `keynote`, `award`, `visitor`, `interview`, `podcast`. Any word works. |
| `title` | yes | The headline of the item, e.g. `AIED 2026`. |
| `body` | no | The description. Plain text is fine; HTML (`<a>`, `<strong>`, `<em>`) is allowed for in-text links/formatting. |
| `link_url` | no | A link for the item (a YouTube link becomes a clickable thumbnail — see below). |
| `link_text` | no | The clickable words for `link_url` (e.g. `here`). If blank, a sensible default is used. |
| `image` | no | One or more local image filenames in `/images`. **Separate multiple with a semicolon `;`** → they become a mini image **carousel** with arrows. |

**Order:** the **top data row shows first** (newest at top). Add fresh news as a new row
directly under the header line.

**Media shown for each item (left of the text):**
- **Images** — put one or more filenames in the `image` column. One image shows on its
  own; several (separated by `;`) become a **carousel** with ‹ › arrows. Clicking opens
  the full-screen slideshow. Example: `AIED2026_1.jpeg; AIED2026_2.jpeg; AIED2026_3.jpeg`.
- **YouTube** — if `image` is empty and `link_url` is a YouTube link, the video's
  **thumbnail** is shown automatically (with a ▶ badge) and links to the video. Nothing
  else to do.
- **Neither** — the item shows as text only.

**Links in the text:**
- *Simple (one link):* put it in `link_url` + `link_text` (e.g. `link_text = here`).
- *Links inside the sentence, or several:* write them directly in `body` as HTML and
  leave `link_url`/`link_text` blank.

**Example rows:**

```csv
date,venue,category,title,body,link_url,link_text,image
Jul-26,"Seoul, Korea",conference,AIED 2026,Our team presented at AIED 2026.,,,AIED2026_1.jpeg;AIED2026_2.jpeg
May-26,"Minerva Han, Turkey",public lecture,Human-AI Augmentation,A public lecture by Prof. Cukurova.,https://www.youtube.com/watch?v=EjyCDCPWQeQ,,
```

---

## 2. Reading Club / Workshop — `data/reading-club.csv` + `data/workshop.csv`

This page (nav label **"Reading Club/Workshop"**) has two **tabs** at the top — a
**Reading Club** tab and a **Workshops** tab (like the Journal/Conference tabs on the
Publications page). Each is fed by its own CSV.

### 2a. Reading club schedule — `data/reading-club.csv`

Columns: `year, date, chair, paper_title, paper_url`

| Column | Required | What to put |
|---|---|---|
| `year` | yes | The year the meetings are grouped under, e.g. `2025`. Rows with the same `year` appear together under one heading. |
| `date` | yes | The month/date label shown, e.g. `Jan 2025` or `02 Mar 2022`. |
| `chair` | yes | Who chairs the session, e.g. `Zoe Li`. |
| `paper_title` | no | The paper title (or a full citation). May include `<em>…</em>`. |
| `paper_url` | no | Link to the paper. |

**APA citations (automatic):** each row also has an **`apa`** column that holds a
formatted APA citation with the DOI as a clickable link. **You don't fill this in** —
you just add `paper_title` + `paper_url`, then run:

```bash
python3 scripts/update_reading_club.py
```

It looks up each paper on Crossref (by DOI, else by title) and fills `apa`. Anything it
can't resolve falls back to the linked title, so nothing is ever lost. The page shows
`apa` when present. (If you'd rather hand-write a citation for one row, just type it into
that row's `apa` cell — the script only overwrites when it finds a match.)

**Grouping & order:** meetings are grouped by `year` in the order the years first
appear in the file (currently newest year first). Within a year they appear in row
order. To start a new year, just add rows with that new `year` value at the top.

**"Paper to be announced":** leave **both** `paper_title` and `paper_url` blank — the
row will automatically show *Paper to be announced* in muted italics.

**Example rows:**

```csv
year,date,chair,paper_title,paper_url
2026,Jan 2026,Zoe Li,"A great paper about AI in education",https://doi.org/10.xxxx/yyyy
2026,Feb 2026,Qi Zhou,,
```

### 2b. Workshops — `data/workshop.csv`

Columns: `year, date, chair, workshop_title`

| Column | Required | What to put |
|---|---|---|
| `year` | yes | Year the workshop is grouped under, e.g. `2025`. |
| `date` | yes | Date label, e.g. `Jul-25`. |
| `chair` | yes | Who ran the workshop. |
| `workshop_title` | yes | What the workshop was about. |

Same grouping behaviour as the reading club. Blank rows are ignored, so leftover empty
lines in the file are fine.

```csv
year,date,chair,workshop_title
2025,Jul-25,Yishan Du,Analyzing LLM behaviour via embedding-based similarity metrics
2025,Jun-25,Kester Wong,Deploying BERT and PrefixSpan + Logistic Regression
```

---

## 3. Social — termly events — `data/social.csv`

Columns: `Term, date, title, organiser, image`

| Column | Required | What to put |
|---|---|---|
| `Term` | no | Term label shown before the date, e.g. `Term 1`. |
| `date` | yes | The date, e.g. `17-Mar-26`. Shown as `Term 1 · 17-Mar-26`. |
| `title` | yes | Event name, e.g. `Japanese Night`. |
| `organiser` | yes | Host's name (shown as "Organised by …"). |
| `image` | yes | The photo filename in `/images` (see **Images** below). |

**Example row:**

```csv
Term,date,title,organiser,image
Term 1,17-Sep-25,Japanese Night,Taro Yamada,social-2025-t1-japanese.jpg
```

---

## 4. Social — "Life in the Lab" gallery — `data/life-in-the-lab.csv`

This is the **gallery at the bottom of the Social page** — for informal, non-termly
moments (trips, celebrations, everyday lab life). It's laid out as a **3-column grid**,
one **slideshow per event**: each event shows one photo at a time with **left/right
arrows** (and a counter), and clicking a photo opens a **full-screen slideshow** (arrow
keys or on-screen arrows to move, Esc to close).

Columns: `event, date, image, caption`

| Column | Required | What to put |
|---|---|---|
| `event` | yes | The album/event name, e.g. `Summer punting trip`. **All rows with the same `event` name are grouped into one album.** |
| `date` | no | Date/label for the album, e.g. `Jun 2025`. Use the same value on every row of that event. |
| `image` | yes | One photo filename in `/images` (see **Images** below). **One row = one photo.** |
| `caption` | no | Short caption for that individual photo (shown on the photo and in the lightbox). |

**Multiple photos per event:** add **one row per photo, repeating the same `event`
name** (and `date`). They'll appear together as one album, in row order. Events appear
in the order they first show up in the file.

**Example — two albums, two photos each:**

```csv
event,date,image,caption
Summer boat trip,2026,boat-2026-1.jpg,On the river
Summer boat trip,2026,boat-2026-2.jpg,Picnic afterwards
Potluck Party,2025,potluck-2025.jpg,
```

Add as many events and photos as you like — the page grows automatically.

---

## Images — naming convention

Images live in **category subfolders** inside `/images`. In the CSV you write **just
the filename** — the site adds the folder automatically:

| CSV | Put the file in | Example filename in the CSV |
|---|---|---|
| `team.csv` | `images/team/` | `jane.jpg` |
| `news.csv` | `images/news/` | `AIED2026_1.jpeg` |
| `social.csv` | `images/social/` | `ChineseNight_2026.jpeg` |
| `life-in-the-lab.csv` | `images/social/` | `Summerboat_Aug2026_2.jpg` |

(The site logo stays in `images/` itself — leave it alone.)

**Two things that will break images on the live GitHub site even if they look fine on a
Mac:**
- **HEIC/HEIF photos don't display in any browser.** Convert iPhone `.HEIC` photos to
  `.jpg` first (on a Mac: select in Finder → right-click → Quick Actions → Convert
  Image → JPEG), then reference the `.jpg` name.
- **Filenames are case-sensitive on GitHub** (not on macOS). `Summerboat.jpg` and
  `summerboat.jpg` are different files there. Make the name in the CSV match the actual
  file exactly, including capitals and the extension (`.jpg` vs `.jpeg` vs `.JPG`).

`.jpg`, `.jpeg`, `.png`, `.webp` and `.avif` all work. Keep photos reasonably sized
(long edge ~1600px) so pages stay fast. Existing photos keep their original Wix-style
filenames — that's fine; only new ones need the convention.

> **Why local files, not links:** pasting an external URL (Google Drive, Wix, etc.)
> works until that link dies or is moved, which then breaks the photo on the site.
> Local files in `/images` keep the site self-contained.

---

## 6. Publications — `data/publications.csv` (automatic)

**You do not edit this one by hand.** Unlike the sections above, the publications list
**updates itself automatically** from [OpenAlex](https://openalex.org) (a free, open
scholarly database).

**How it works:** a scheduled job — `.github/workflows/update-publications.yml` — runs
every **Monday** on GitHub's servers. It runs `scripts/update_publications.py`, which
fetches the author's most recent works, formats them as citations, splits them into
**journal** vs **conference/preprint**, writes `data/publications.csv`, and commits it.
Your live site then shows the refreshed list. **Free** (GitHub Actions is free for
public repos), and needs no upkeep.

**One-time GitHub setup (after you push the repo):**
1. Push the project to a GitHub repo and turn on **GitHub Pages** (Settings → Pages).
2. Settings → **Actions → General → Workflow permissions** → choose **“Read and write
   permissions”** and Save. (This lets the weekly job commit the updated CSV.)
3. Optional: go to the **Actions** tab → *Update publications* → **Run workflow** to
   trigger it once immediately instead of waiting for Monday.

**To change what's pulled**, edit the top of `scripts/update_publications.py`:
- `AUTHOR_IDS` — the OpenAlex author ID(s). Currently Mutlu Cukurova (`A5010726815`).
  Find an ID at `https://api.openalex.org/authors?search=Firstname%20Lastname`. Add more
  IDs to the list to include other team leads' work.
- `MAX_ITEMS` — how many recent publications to show (currently 40).

**Note:** OpenAlex is comprehensive but not perfect — occasionally a venue name or author
list is imperfect in the source data. For a fully hand-curated list, the Google Scholar
link on the page remains the fallback. If you'd rather curate publications manually like
the other sections, that can be switched on request.

---

## Quick checklist to add something

- **A news item:** add a row at the top of `data/news.csv` → pick a `category` → write
  the `body` → (optional) add one link.
- **A reading-club meeting:** add a row to `data/reading-club.csv` with `year`, `date`,
  `chair`, and the paper title + link (or leave blank for "to be announced").
- **A termly social event:** drop the photo in `/images`, add a row to
  `data/social.csv`.
- **A gallery photo:** drop the photo in `/images`, add a row to `data/gallery.csv`.

Then preview with the local server (or just push to the live site) and check it looks
right.
