// Checks links handed to Chrome from outside (other apps), plus tabs that must be left alone.
// Opens a visible Chrome window with a throwaway profile for about 20 seconds: a second
// Chrome launch can only hand a URL to a running instance that isn't headless.
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const assert = require('node:assert/strict');
const puppeteer = require('puppeteer-core');
const { CHROME } = require('../scripts/chrome.cjs');

const EXT = process.env.EXT || path.resolve(__dirname, '..');
const PROBE = path.join(__dirname, 'probe');
const server = http.createServer((req, res) => {
  res.setHeader('content-type', 'text/html');
  res.end(`<!doctype html><h1>${req.url}</h1>`);
});

(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  // Short path on purpose: Chrome's single-instance socket lives in the profile folder.
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rt-'));
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: false,
    pipe: true,
    userDataDir: profile,
    ignoreDefaultArgs: true, // Puppeteer's defaults make Chrome refuse URLs handed over by a second launch
    args: ['--no-first-run', '--no-default-browser-check', `--user-data-dir=${profile}`,
      '--enable-unsafe-extension-debugging', '--window-size=700,500', '--window-position=40,40'],
  });
  try {
    const [first] = await browser.pages();
    const conn = (await first.createCDPSession()).connection();
    const { id: extId } = await conn.send('Extensions.loadUnpacked', { path: EXT });
    const { id: probeId } = await conn.send('Extensions.loadUnpacked', { path: PROBE });
    const worker = async (id) => (await browser.waitForTarget((t) => t.type() === 'service_worker' && t.url().includes(id))).worker();
    const probe = await worker(probeId);
    await worker(extId);

    const settle = (ms = 1500) => new Promise((resolve) => setTimeout(resolve, ms));
    const tabs = () => probe.evaluate(() => chrome.tabs.query({}).then((all) => all.map(({ id, url, active }) => ({ id, url, active }))));
    const lastCommit = (url) => probe.evaluate((u) => self.commits.filter((c) => c.url === u).at(-1)?.transitionType, url);
    // Hands the URL to the running Chrome, like macOS does when another app opens a link.
    const openFromOutside = (url) => new Promise((resolve) => execFile(CHROME, [`--user-data-dir=${profile}`, url], () => resolve()));

    await first.goto(`${base}/issue/1`);
    const other = await browser.newPage();
    await other.goto(`${base}/elsewhere`);
    await other.bringToFront();
    await settle();
    const before = (await tabs()).length;

    await openFromOutside(`${base}/issue/1`);
    await settle();
    let now = await tabs();
    assert.equal(await lastCommit(`${base}/issue/1`), 'start_page');
    assert.equal(now.length, before, 'a link from another app to an open page should not add a tab');
    assert.equal(now.find((t) => t.active).url, `${base}/issue/1`, 'the existing tab should be active');
    console.log('ok: a link from another app switches to the open tab');

    await openFromOutside(`${base}/issue/3`);
    await settle();
    now = await tabs();
    assert.equal(now.length, before + 1, 'a link from another app to a new page should add a tab');
    assert.equal(now.find((t) => t.active).url, `${base}/issue/3`);
    console.log('ok: a link from another app to a page that is not open opens a tab as usual');

    const issue1 = now.find((t) => t.url === `${base}/issue/1`).id;
    const duplicate = await probe.evaluate((id) => chrome.tabs.duplicate(id).then((tab) => tab.id), issue1);
    await settle();
    assert.equal((await tabs()).length, before + 2, 'a duplicated tab should stay');
    console.log('ok: duplicating a tab is left alone');

    await probe.evaluate((id) => chrome.tabs.remove(id), duplicate);
    await settle(500);
    await probe.evaluate(() => chrome.sessions.restore());
    await settle();
    assert.equal((await tabs()).length, before + 2, 'a reopened tab should stay');
    console.log('ok: reopening a closed tab is left alone');
  } finally {
    await browser.close();
    server.close();
    fs.rmSync(profile, { recursive: true, force: true });
  }
})().catch((error) => { console.error(error); process.exit(1); });
