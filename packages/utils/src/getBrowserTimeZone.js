export const getBrowserTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    // Time zone not supported in this browser.
    return 'Australia/Melbourne';
  }
};
