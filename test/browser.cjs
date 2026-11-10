// Loads the extension in headless Chrome and checks links opened from a page.
const http = require('node:http');
const path = require('node:path');
const assert = require('node:assert/strict');
const puppeteer = require('puppeteer-core');
const { CHROME } = require('../scripts/chrome.cjs');

const EXT = process.env.EXT || path.resolve(__dirname, '..');
const html = (body) => `<!doctype html><title>t</title>${body}`;
const server = http.createServer((req, res) => {
  res.setHeader('content-type', 'text/html');
  res.end(req.url.startsWith('/source')
    ? html('<a id="target" href="/issue/1">same</a><br><a id="anchor" href="/issue/1#comment-7">anchor</a><br><a id="other" href="/issue/2">other</a><br><a id="blank" href="/issue/1" target="_blank">blank</a>')
    : html(`<h1>${req.url}</h1><div style="height:3000px"></div><p id="comment-7">c</p>`));
});

(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    pipe: true,
    ignoreDefaultArgs: ['--disable-extensions'],
    args: ['--enable-unsafe-extension-debugging'],
  });
  try {
    const [first] = await browser.pages();
    const conn = (await first.createCDPSession()).connection();
    const { id } = await conn.send('Extensions.loadUnpacked', { path: EXT });
    const sw = await (await browser.waitForTarget((t) => t.type() === 'service_worker' && t.url().includes(id))).worker();
    const tabs = () => sw.evaluate(() => chrome.tabs.query({}).then((all) => all.map(({ url, active }) => ({ url, active }))));
    const settle = () => new Promise((resolve) => setTimeout(resolve, 800));
    const cmdClick = async (page, selector) => {
      await page.keyboard.down('Meta');
      await page.click(selector);
      await page.keyboard.up('Meta');
      await settle();
    };
    const backTo = async (page) => { await page.bringToFront(); await settle(); };

    await first.goto(`${base}/issue/1`);
    const source = await browser.newPage();
    await source.goto(`${base}/source`);
    await backTo(source);
    const before = (await tabs()).length;

    await cmdClick(source, '#target');
    let now = await tabs();
    assert.equal(now.length, before, 'cmd-click on an open page should not add a tab');
    assert.equal(now.find((t) => t.active).url, `${base}/issue/1`, 'the existing tab should be active');
    console.log('ok: cmd-click on an already open page switches to it');

    await backTo(source);
    await first.evaluate(() => { window.marker = 'kept'; });
    await cmdClick(source, '#anchor');
    now = await tabs();
    assert.equal(now.length, before);
    assert.equal(now.find((t) => t.active).url, `${base}/issue/1#comment-7`, 'should jump to the anchor in the existing tab');
    assert.equal(await first.evaluate(() => window.marker), 'kept', 'the page should not reload');
    console.log('ok: a link with a new #anchor jumps there without a reload');

    await backTo(source);
    await source.click('#blank');
    await settle();
    assert.equal((await tabs()).length, before, 'target=_blank to an open page should not add a tab');
    console.log('ok: target=_blank to an already open page switches to it');

    await backTo(source);
    await cmdClick(source, '#other');
    now = await tabs();
    assert.equal(now.length, before + 1, 'cmd-click on a page that is not open should add a tab');
    assert.equal(now.find((t) => t.active).url, `${base}/source`, 'and keep it in the background as usual');
    console.log('ok: cmd-click on a new page opens a background tab as usual');

    await sw.evaluate(() => chrome.storage.local.set({ enabled: false }));
    await cmdClick(source, '#target');
    assert.equal((await tabs()).length, before + 2, 'turned off: duplicates allowed');
    console.log('ok: turned off, it leaves new tabs alone');
  } finally {
    await browser.close();
    server.close();
  }
})().catch((error) => { console.error(error); process.exit(1); });
