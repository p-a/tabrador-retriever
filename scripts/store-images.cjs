// Renders the Web Store screenshots and promo tiles from store/src/assets.html.
// JPEG on purpose: the store rejects images with an alpha channel.
const path = require('node:path');
const puppeteer = require('puppeteer-core');
const { CHROME } = require('./chrome.cjs');

const dir = path.resolve(__dirname, '..', 'store');
const assets = {
  'screenshot-1': 'screenshot-1-1280x800',
  'screenshot-2': 'screenshot-2-1280x800',
  'screenshot-3': 'screenshot-3-1280x800',
  'promo-small': 'promo-small-440x280',
  marquee: 'promo-marquee-1400x560',
};

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 1000, deviceScaleFactor: 1 });
  await page.goto(`file://${path.join(dir, 'src', 'assets.html')}`);
  for (const [id, name] of Object.entries(assets)) {
    await (await page.$(`#${id}`)).screenshot({ path: path.join(dir, `${name}.jpg`), type: 'jpeg', quality: 95 });
    console.log(`store/${name}.jpg`);
  }
  await browser.close();
})();
