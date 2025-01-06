/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

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

export const getAndroidVersion = () => {
  const userAgent = navigator.userAgent;

  // Check if the device is Android
  if (!isAndroidDevice()) {
    return null;
  }

  // Extract Android version from the User-Agent string
  const match = userAgent.match(/Android\s([0-9.]+)/);
  if (!match || !match[1]) {
    return null;
  }
  return parseFloat(match[1]); // e.g., "13.0" => 13
};
