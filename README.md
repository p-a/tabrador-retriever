# Tabrador Retriever

<img src="icons/128.png" width="64" alt="">

Fetches the tab you already have. A Chrome extension: when a link would open in a new tab and that page is
already open, Chrome switches to the open tab instead. That covers links in web pages (cmd-click, middle click,
`target="_blank"`, "Open link in new tab") and links clicked in other apps (chat, mail, terminal).

Duplicating a tab, reopening a closed tab and restoring a session are left alone.

## Install

1. Open `chrome://extensions` and turn on **Developer mode** (top right).
2. Click **Load unpacked** and pick this folder (the repo root).
3. Pin the icon if you want the on/off switch at hand. Click the dog to turn it off; the badge then says "off".

After editing the files, click the reload arrow on the extension's card.

## What counts as the same page

- Same host, path and query. The `#hash`, http/https, `www.`, a trailing slash and query param order don't matter.
- Jira issues (`/browse/KEY-123`) match whatever the query string is.
- Confluence pages match on the page id, so a renamed title still matches.
- If the link has a different `#anchor`, the open tab jumps to it without reloading.

The tab you clicked in never counts as a match, so cmd-clicking a link to the page you're on still gives you a copy.
Rules live in `url-key.js`.

## Getting a duplicate anyway

- Right-click the tab and choose **Duplicate**.
- Cmd-click a link to the page you're on.
- Paste the URL into a new tab.
- Click the toolbar icon to turn Tabrador off for a moment.

## Privacy

Tabrador reads the addresses of your open tabs on your device to find a match. It can't read page content and sends
nothing anywhere. See [store/privacy-policy.md](store/privacy-policy.md).

## Development

The extension itself has no build step and no dependencies. The tests and image scripts use Node and drive a real
Chrome through `puppeteer-core` (set `CHROME_PATH` if Chrome isn't in the default macOS place).

```sh
npm install
npm test                  # url rules + links from pages, in headless Chrome
npm run test:external     # links from other apps; opens a visible Chrome window for ~20 s
npm run icons             # icons/tabrador.svg -> icons/*.png
npm run store-images      # store/src/assets.html -> store/*.jpg
./pack.sh                 # dist/tabrador-<version>.zip for the Web Store
```

The 128 px icon has 16 px of transparent padding, as the Web Store asks. `store/listing.md` has everything the
Web Store dashboard asks for. Bump `version` in `manifest.json` (and `package.json`) before each upload.
