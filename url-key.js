// Two URLs with the same key are treated as the same page.
// The hash is ignored, and so are http/https, "www.", a trailing slash and query param order.
export const pageKey = (raw) => {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(url.protocol)) return null;

  const host = url.host.toLowerCase().replace(/^www\./, '');
  const path = url.pathname.replace(/\/+$/, '') || '/';

  // Jira issue: /browse/PROJ-123, whatever the query (focusedCommentId, atlOrigin, ...)
  const issue = path.match(/^\/browse\/([a-z][a-z0-9_]*-\d+)$/i);
  if (issue) return `${host}/browse/${issue[1].toUpperCase()}`;

  // Confluence page: the id identifies it, the title slug after it can change
  const page = path.match(/^\/wiki\/spaces\/[^/]+\/pages\/(\d+)/);
  if (page) return `${host}/wiki/pages/${page[1]}`;

  url.searchParams.sort();
  return `${host}${path}${url.search}`;
};

export const withoutHash = (raw = '') => raw.split('#')[0];
