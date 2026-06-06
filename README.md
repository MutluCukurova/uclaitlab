# UCLAIT — UCL Analytics & AI for Learning Team

A rebuilt, static version of the UCLAIT lab website, redesigned in a **bold contemporary AI-lab** style. Plain HTML / CSS / JavaScript — **no build step, no dependencies, no framework**. Open it in a browser, drop it on any host, done.

The content is reproduced from the existing Wix site (`mutlucukurova.wixsite.com/uclatlab`), reorganised across the same seven sections.

---

## File structure

```
uclat-site/
├── index.html            Home (hero, mission, themes, dates, contact)
├── team.html             Team, grouped by role
├── research.html         Research themes
├── publications.html     Journal + conference publications (tabbed)
├── news.html             News feed + media gallery
├── reading-club.html     Full 2022–2025 reading-club schedule
├── social.html           Termly social events
├── assets/
│   ├── styles.css        Design system (one shared stylesheet)
│   └── main.js           Nav, theme toggle, scroll reveal, tabs
├── images/               (created when you run localize_images.sh)
├── localize_images.sh    Downloads images off Wix → makes the site self-contained
└── README.md
```

---

## Run it locally

**Simplest:** double-click `index.html` — it opens in your browser and works immediately.

**Recommended (mirrors real hosting):** serve it over a local web server so paths behave exactly as they will once deployed.

```bash
cd uclat-site
python3 -m http.server 8000      # then open http://localhost:8000
# — or —
npx serve .                      # if you have Node.js
```

---

## Images — important

The environment that generated this site could **not** reach Wix's image CDN, so every image is currently **hot-linked** to `static.wixstatic.com`. This means:

- The site looks complete the moment you open it (your browser loads the images directly from Wix).
- But it still depends on Wix. If you close the Wix account, the images break.

To **fully cut ties with Wix**, run the included script on your own machine:

```bash
cd uclat-site
bash localize_images.sh
```

It downloads every referenced image into `./images/`, then rewrites the HTML to point at the local copies. By default it grabs each image at **3× display size** for crispness on high-resolution screens; use `SCALE=1 bash localize_images.sh` for exact-size copies. After it runs, the site is entirely self-contained.

> Requirements: `bash`, `curl`, `perl` (all preinstalled on macOS and Linux).

---

## Deploy

Because it is static, it works on essentially any host:

- **GitHub Pages** — push the folder to a repo, enable Pages on the `main` branch (`/root`). Live in a minute.
- **Netlify / Vercel / Cloudflare Pages** — drag the `uclat-site` folder onto the dashboard, or point it at your repo. No build command needed.
- **UCL / institutional web space** — upload the folder contents via SFTP. `index.html` is the entry point.

For a custom domain (e.g. a `ucl.ac.uk` subdomain or your own), configure it in your host's domain settings — no code changes required.

---

## Customising

- **Colours & type** live as CSS variables at the top of `assets/styles.css` (`--accent`, `--bg`, `--gradient`, fonts, radii). Change them once, the whole site follows.
- **Light/dark** — a toggle sits in the top-right of every page; the choice is remembered. Dark is the default.
- **Editing content** — each page is hand-readable HTML; text and links sit in plain markup.
- **Navigation / footer** are repeated in each `.html` file (the cost of having no build step). To add a page, copy an existing file, edit the `<main>`, and add a link to the seven `<nav>` and footer blocks.

---

## Notes on fidelity

The text, people, roles, publications, reading-club entries, news items and events are reproduced from the source site. A few light, content-neutral improvements were made:

- Tracking parameters (Outlook safe-links, `casa_token`, URL text-fragments) were stripped from external links so they resolve cleanly to the same destinations.
- DOIs in the publications list were turned into clickable `https://doi.org/...` links.
- The team is grouped by role (Director / Postdoc / PhD Researchers / Postgraduate / Alumni) rather than a flat list.
- Reading-club entries are organised into per-year blocks; social events are ordered chronologically.

Anything you'd like changed — palette, layout, wording, an added page, or a different image-handling approach — is straightforward to adjust.
