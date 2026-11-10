// Renders icons/tabrador.svg to the PNG sizes the manifest uses.
// Toolbar sizes are full-bleed; the 128 px icon is 96 px of artwork with 16 px of padding, as the Web Store asks.
const fs = require('node:fs');
const path = require('node:path');
const puppeteer = require('puppeteer-core');
const { CHROME } = require('./chrome.cjs');

const dir = path.resolve(__dirname, '..', 'icons');
const svg = Buffer.from(fs.readFileSync(path.join(dir, 'tabrador.svg'))).toString('base64');

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage();
  for (const size of [16, 32, 48, 128]) {
    const art = size === 128 ? 96 : size;
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    await page.setContent(`<style>html,body{margin:0;background:transparent}img{display:block}</style>
      <img style="margin:${(size - art) / 2}px" width="${art}" height="${art}" src="data:image/svg+xml;base64,${svg}">`);
    await page.waitForFunction(() => document.images[0].complete);
    await page.screenshot({ path: path.join(dir, `${size}.png`), omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
    console.log(`icons/${size}.png`);
  }
  await browser.close();
})();
