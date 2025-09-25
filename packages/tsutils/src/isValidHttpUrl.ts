export function isValidHttpUrl(str: string) {
  try {
    const url = new URL(str);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch (e) {
    if (e instanceof TypeError) return false;
    throw e;
  }
}
