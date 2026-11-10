import { pageKey, withoutHash } from './url-key.js';

const isEnabled = async () => (await chrome.storage.local.get({ enabled: true })).enabled;

const showState = (enabled) => {
  chrome.action.setBadgeText({ text: enabled ? '' : 'off' });
  chrome.action.setBadgeBackgroundColor({ color: '#3B2207' });
  chrome.action.setBadgeTextColor({ color: '#FFFFFF' });
  chrome.action.setTitle({ title: `Tabrador: ${enabled ? 'on' : 'off'} (click to turn ${enabled ? 'off' : 'on'})` });
};

const refreshState = async () => showState(await isEnabled());
chrome.runtime.onStartup.addListener(refreshState);
chrome.runtime.onInstalled.addListener(refreshState);

chrome.action.onClicked.addListener(async () => {
  const enabled = !(await isEnabled());
  await chrome.storage.local.set({ enabled });
  showState(enabled);
});

// Prefer a match in the same window, then the one used most recently.
const preference = (windowId) => (a, b) =>
  (b.windowId === windowId) - (a.windowId === windowId) || (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0);

// If `url` is already open in another tab, switch to that tab and close the new one (`tabId`).
const reuseOpenTab = async ({ tabId, url, sourceTabId }) => {
  const key = pageKey(url);
  if (!key || !(await isEnabled())) return;

  const tabs = await chrome.tabs.query({});
  const opened = tabs.find((tab) => tab.id === tabId);
  const existing = tabs
    .filter((tab) => tab.id !== tabId && tab.id !== sourceTabId)
    .filter((tab) => !opened || tab.incognito === opened.incognito)
    .filter((tab) => pageKey(tab.url || tab.pendingUrl) === key)
    .sort(preference(opened?.windowId))[0];
  if (!existing) return;

  // Same page but a different #anchor: jump to it (no reload, the hash change is in-page).
  const jumpTo = new URL(url).hash && url !== existing.url && withoutHash(url) === withoutHash(existing.url);

  await chrome.tabs.update(existing.id, { active: true, ...(jumpTo && { url }) });
  await chrome.windows.update(existing.windowId, { focused: true });
  await chrome.tabs.remove(tabId).catch(() => {});
};

// A link in a page opens in a new tab: cmd/ctrl-click, middle click, target="_blank",
// "Open link in new tab" and window.open().
chrome.webNavigation.onCreatedNavigationTarget.addListener(({ tabId, sourceTabId, url }) =>
  reuseOpenTab({ tabId, url, sourceTabId }),
);

// A link clicked in another app (Claude, Slack, Mail, Terminal, ...). Chrome reports these
// as "start_page" navigations. Restored, reopened and duplicated tabs report other types.
chrome.webNavigation.onCommitted.addListener(({ tabId, frameId, url, transitionType }) => {
  if (frameId === 0 && transitionType === 'start_page') reuseOpenTab({ tabId, url });
});
