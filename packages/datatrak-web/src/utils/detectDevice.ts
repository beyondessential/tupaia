export const isAndroidDevice = () => {
  return /Android/i.test(navigator.userAgent);
};

/**
 * Returns the major and minor Android version if applicable and present as a single number.
 *
 * @privateRemarks Ignores the patch version number, since return type is a floating point number.
 */
export const getAndroidVersion = () => {
  const userAgent = navigator.userAgent;

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
