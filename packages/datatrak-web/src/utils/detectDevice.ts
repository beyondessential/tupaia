// detect if the device is a mobile device (without relying on screen size)
export const getIsMobileDevice = () => {
  const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return regex.test(navigator.userAgent);
};

export const BROWSERS = {
  CHROME: 'Chrome',
  FIREFOX: 'Firefox',
  SAFARI: 'Safari',
  OPERA: 'Opera',
  EDGE: 'Edge',
};

// get the browser name
export const getBrowser = () => {
  const userAgent = window.navigator.userAgent;
  if (userAgent.match(/chrome|chromium|crios/i)) {
    return BROWSERS.CHROME;
  }
  if (userAgent.match(/firefox|fxios/i)) {
    return BROWSERS.FIREFOX;
  }
  if (userAgent.match(/safari/i)) {
    return BROWSERS.SAFARI;
  }
  if (userAgent.match(/opr/i)) {
    return BROWSERS.OPERA;
  }
  if (userAgent.match(/edg/i)) {
    return BROWSERS.EDGE;
  }
  return null;
};

export const isAndroidDevice = () => {
  return /Android/i.test(navigator.userAgent);
};

/**
 * Returns the major and minor Android version if applicable and present as a single number.
 *
 * @privateRemarks Ignores the patch version number, since return type is a floating point number.
 */
export const getAndroidVersion = userAgent => {
  // const userAgent = navigator.userAgent;

  // Check if the device is Android
  if (!isAndroidDevice()) {
    return null;
  }

  // Extract Android version from the User-Agent string
  const match = userAgent.match(/Android\s(\d+(.\d+)?)/i);
  // Major version                      ←  \d+
  // Minor version, if present          ←     (.\d+)?

  return match?.[1]
    ? Number.parseFloat(match[1]) // e.g., "13.1" => 13.1
    : null;
};
