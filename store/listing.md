# Chrome Web Store: what to fill in

Upload `dist/tabrador-1.1.0.zip` (build it with `./pack.sh`). Name, summary and icon come from the manifest.
Every later upload needs a higher `version` in `manifest.json`.

## Store listing tab

**Description**

```
Tabrador Retriever fetches the tab you already have.

Cmd-click a link to an issue you opened an hour ago and you get yet another copy of it. Tabrador Retriever stops that: when a link would open a page you already have open, Chrome switches to that tab instead, and the extra copy closes.

What it catches
• Cmd-click, Ctrl-click and middle-click
• Links that open in a new tab by themselves
• "Open link in new tab" from the right-click menu
• Links you click in other apps: chat, mail, your terminal

What counts as the same page
• The same address. #anchors, http/https, "www." and a trailing slash don't matter
• Jira issues match on the issue key, whatever is in the query string
• Confluence pages match on the page id, so a renamed page still matches
• If the link points to a different #anchor, the open tab jumps there without reloading

When you want a copy anyway
• Click the dog in the toolbar to pause it. The badge says "off" until you click again
• Right-click a tab and choose Duplicate. Duplicated tabs are left alone
• Cmd-click a link to the page you're on

Privacy
Tabrador Retriever compares the addresses of your open tabs on your device. It can't read page content, sends nothing anywhere and has no analytics.

Jira and Confluence are trademarks of Atlassian. Tabrador Retriever isn't affiliated with Atlassian.
```

**Category:** Productivity → Workflow & Planning
**Language:** English
**Homepage URL:** https://github.com/p-a/tabrador-retriever
**Support URL:** https://github.com/p-a/tabrador-retriever/issues

**Graphics** (all in `store/`)

| Field | File |
| --- | --- |
| Store icon | `icons/128.png` |
| Screenshots | `screenshot-1-1280x800.jpg`, `screenshot-2-1280x800.jpg`, `screenshot-3-1280x800.jpg` |
| Small promo tile | `promo-small-440x280.jpg` |
| Marquee promo tile (optional) | `promo-marquee-1400x560.jpg` |

## Privacy practices tab

**Single purpose**

```
Prevents duplicate tabs: when a link would open a page that is already open in another tab, Tabrador Retriever switches to that tab instead.
```

**Permission justifications**

| Permission | Justification |
| --- | --- |
| `tabs` | Reads the URLs of open tabs to find one that already shows the page a link is opening, then switches to that tab and closes the new duplicate. |
| `webNavigation` | Detects when a link opens a new tab, from a web page or from another application, and reads the URL being opened so it can be compared with the open tabs. |
| `storage` | Stores one setting on the device: whether the user has paused the extension with the toolbar button. |

**Host permissions:** none requested.
**Remote code:** No, I am not using remote code.

**Data usage**

- Tick **Web history**. Google's user data FAQ says data must be disclosed even when it's only processed on the device. Tabrador reads tab URLs and never stores or sends them.
- Tick all three certifications: no selling or transfer to third parties, no use unrelated to the single purpose, no use for creditworthiness or lending.

**Privacy policy URL:** https://gist.github.com/p-a/88b22ad817b85ec08c9dab4138a8263c

The gist is a copy of `privacy-policy.md`. When the policy changes, update both, for example with
`gh gist edit 88b22ad817b85ec08c9dab4138a8263c --filename tabrador-retriever-privacy-policy.md store/privacy-policy.md`.

## Account and distribution

- Registering a developer account has a one-time fee and needs 2-step verification on the Google account.
- The dashboard asks whether you're a trader under EU rules. A personal, free extension is normally non-trader. Your publisher name is shown on the listing either way.
- **Visibility:** Public, Unlisted (only people with the link) or Private (testers you name). Unlisted works well for sharing with colleagues first.
- Review usually takes a few days. Reading tab URLs gets a closer look.
