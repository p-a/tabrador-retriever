self.commits = [];
chrome.webNavigation.onCommitted.addListener(({ frameId, url, transitionType, transitionQualifiers }) => {
  if (frameId === 0) self.commits.push({ url, transitionType, transitionQualifiers });
});
