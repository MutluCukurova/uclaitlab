#!/bin/bash
# Double-click this file to preview the UCLAIT site locally.
# It starts a small web server (so the CSV-driven pages load) and opens your browser.
# Leave the Terminal window open while you preview; close it (or press Ctrl+C) to stop.

cd "$(dirname "$0")" || exit 1

PORT=8000
# If 8000 is busy, step up until we find a free port.
while lsof -i :"$PORT" >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

URL="http://localhost:$PORT"
echo "Serving the UCLAIT site at $URL"
echo "Opening your browser… (close this window to stop the server)"

# Open the browser a moment after the server starts.
( sleep 1; open "$URL" ) &

python3 -m http.server "$PORT"
