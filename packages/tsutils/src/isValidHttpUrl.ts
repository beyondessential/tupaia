export function isValidHttpUrl(str: string): str is `https://${string}` | `http://${string}` {
  try {
    const url = new URL(str);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch (e) {
    if (e instanceof TypeError) return false;
    throw e;
  }
}
