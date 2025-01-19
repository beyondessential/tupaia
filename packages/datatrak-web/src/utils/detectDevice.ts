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
