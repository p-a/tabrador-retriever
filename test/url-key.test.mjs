import assert from 'node:assert/strict';
import { pageKey, withoutHash } from '../url-key.js';

const same = [
  ['https://x.atlassian.net/browse/PROJ-123', 'https://x.atlassian.net/browse/proj-123?focusedCommentId=9&atlOrigin=abc'],
  ['https://x.atlassian.net/wiki/spaces/ENG/pages/42/Old+Title', 'https://x.atlassian.net/wiki/spaces/ENG/pages/42/New+Title'],
  ['https://github.com/a/b/pull/1', 'http://www.github.com/a/b/pull/1/#discussion_r5'],
  ['https://example.com/s?a=1&b=2', 'https://example.com/s?b=2&a=1'],
  ['https://example.com', 'https://example.com/'],
];
const different = [
  ['https://x.atlassian.net/browse/PROJ-123', 'https://x.atlassian.net/browse/PROJ-124'],
  ['https://x.atlassian.net/browse/PROJ-123', 'https://x.atlassian.net/jira/software/boards/1?selectedIssue=PROJ-123'],
  ['https://example.com/s?q=a', 'https://example.com/s?q=b'],
  ['http://localhost:3000/', 'http://localhost:4000/'],
];

same.forEach(([a, b]) => assert.equal(pageKey(a), pageKey(b), `${a} vs ${b}`));
different.forEach(([a, b]) => assert.notEqual(pageKey(a), pageKey(b), `${a} vs ${b}`));
['chrome://newtab/', 'about:blank', 'not a url', undefined].forEach((url) => assert.equal(pageKey(url), null, String(url)));
assert.equal(withoutHash('https://a.b/c#d'), 'https://a.b/c');
assert.equal(withoutHash(undefined), '');
console.log('ok: url matching rules');
