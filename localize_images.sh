#!/usr/bin/env bash
# ============================================================================
#  localize_images.sh
#  Downloads every Wix-hosted image referenced by the site into ./images/
#  and rewrites the HTML so the site is fully self-contained (no dependency
#  on Wix's CDN). Run this ON YOUR OWN MACHINE — it needs normal internet
#  access (the build environment that generated the site could not reach the
#  Wix CDN, so images are currently hot-linked to static.wixstatic.com).
#
#  Usage:
#     cd uclat-site
#     bash localize_images.sh           # downloads at 3x display size (crisp)
#     SCALE=1 bash localize_images.sh   # downloads at exact display size
#
#  Requirements: bash, curl, perl, sed, grep  (all standard on macOS & Linux)
# ============================================================================
set -uo pipefail
cd "$(dirname "$0")"
mkdir -p images

SCALE="${SCALE:-3}"   # fetch images at SCALE× the displayed size for sharpness

echo "Scanning HTML for image URLs..."
urls=$(grep -oh 'https://static\.wixstatic\.com/media/[^"]*' ./*.html | sort -u)
count=$(printf '%s\n' "$urls" | grep -c . || true)
echo "Found $count unique image(s). Downloading into ./images/ ..."
echo

i=0
fail=0
printf '%s\n' "$urls" | while IFS= read -r url; do
  [ -z "$url" ] && continue
  i=$((i + 1))

  # Derive a stable, unique local filename from the Wix media id.
  mediaid=$(printf '%s' "$url" | sed -E 's#https://static\.wixstatic\.com/media/([^/]+)/.*#\1#')
  name=$(printf '%s' "$mediaid" | sed 's/[^A-Za-z0-9._~-]/_/g')
  case "$url" in *enc_avif*) name="${name%.*}.avif" ;; esac

  # Request a higher-resolution copy by scaling ONLY the /fill/ output size
  # (the /crop/ region is left untouched so framing stays identical).
  dlurl="$url"
  if [ "$SCALE" != "1" ]; then
    dlurl=$(printf '%s' "$url" | perl -pe "s{/fill/w_(\\d+),h_(\\d+)}{'/fill/w_'.(\$1*$SCALE).',h_'.(\$2*$SCALE)}ge")
  fi

  printf '  [%2s/%s] %s\n' "$i" "$count" "$name"
  if ! curl -fsSL "$dlurl" -o "images/$name"; then
    # Fall back to the exact displayed URL if the upscaled request failed.
    if ! curl -fsSL "$url" -o "images/$name"; then
      echo "         ! download failed — left hot-linked"
      rm -f "images/$name"
      continue
    fi
  fi

  # Point every HTML reference of this URL at the local file.
  for f in ./*.html; do
    perl -i -pe "s{\\Q$url\\E}{images/$name}g" "$f"
  done
done

echo
echo "Done. Images are in ./images/ and the HTML now references them locally."
echo "You can re-open index.html — it no longer depends on the Wix CDN."
