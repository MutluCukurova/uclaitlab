# Deploying UCLAIT to GitHub Pages

This site is plain static HTML/CSS/JS, so GitHub Pages serves it as-is — no build step. All internal links are **relative**, so it works whether the repository is a user site (`username.github.io`) or a project site (`username.github.io/repo-name/`).

Two routes below: the **web UI** (no terminal, recommended) and the **command line**.

---

## Route A — Web browser only (recommended, ~5 minutes)

**1. Get a GitHub account.** If you don't have one, sign up at <https://github.com> (free).

**2. Create a repository.**
- Top-right **+** → **New repository**.
- **Repository name:**
  - For the cleanest URL (`https://USERNAME.github.io/`), name it exactly `USERNAME.github.io` (replace USERNAME with your GitHub username).
  - Otherwise any name works, e.g. `uclat-lab` → the site will live at `https://USERNAME.github.io/uclat-lab/`.
- Set **Public**. Leave "Add a README" unticked (one is already included). Click **Create repository**.

**3. Upload the site files.**
- On the new repo page, click **uploading an existing file** (or **Add file → Upload files**).
- Open your `uclat-site` folder on your computer. Select **everything inside it** — `index.html`, the other `.html` files, the `assets` folder, `.nojekyll`, and (optionally) `README.md`, `DEPLOY.md`, `localize_images.sh`.
- Drag them onto the upload area. The `assets` folder uploads with `styles.css` and `main.js` inside it. Wait for all files to finish.
- Commit message: e.g. `Initial site`. Click **Commit changes**.

> Tip: the `images/` folder is intentionally empty right now (team photos load from Wix's CDN). Empty folders aren't uploaded, and that's fine. To self-host the images, run `localize_images.sh` locally first, then upload the filled `images/` folder too.

**4. Turn on Pages.**
- Repo **Settings** → **Pages** (left sidebar).
- **Source:** "Deploy from a branch". **Branch:** `main`, **Folder:** `/ (root)`. Click **Save**.

**5. Visit your site.**
- Wait ~1 minute, refresh the Pages settings page. It will show **"Your site is live at https://USERNAME.github.io/…"**. Click it.

---

## Route B — Command line (if you prefer git)

From inside the `uclat-site` folder:

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git   # create REPO on github.com first
git push -u origin main
```

Then enable Pages as in Route A, step 4. (Pushing will prompt for a GitHub username + a Personal Access Token instead of a password — create one at Settings → Developer settings → Personal access tokens.)

---

## Updating the site later

- **Web UI:** in the repo, open a file to edit it in place, or **Add file → Upload files** to replace files, then commit. Pages redeploys automatically within a minute.
- **Command line:** edit locally, then `git add . && git commit -m "Update" && git push`.

---

## Optional: custom domain

GitHub Pages supports custom domains (Settings → Pages → **Custom domain**):

- **A UCL subdomain** (e.g. `uclat.ucl.ac.uk`) requires UCL IT to point a DNS `CNAME` at `USERNAME.github.io`. Raise a request with the Knowledge Lab / UCL ISD web team.
- **Your own domain** — add it in the Custom domain box, then create a `CNAME` record at your registrar pointing to `USERNAME.github.io`. Tick **Enforce HTTPS** once the certificate is issued.

---

## Quick checklist

- [ ] Repo created (Public)
- [ ] All files from `uclat-site/` uploaded (incl. `assets/` and `.nojekyll`)
- [ ] Settings → Pages → branch `main`, folder `/ (root)`, Saved
- [ ] Live URL opens and the navigation, styling, and images load
- [ ] (Optional) ran `localize_images.sh` and uploaded `images/` to drop the Wix dependency
