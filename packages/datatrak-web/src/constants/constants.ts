export const HEADER_HEIGHT = '4.375rem';
export const TABLET_BREAKPOINT = '600px'; // mobile size
export const DESKTOP_BREAKPOINT = '960px'; // matches material-ui's theme.breakpoints.values.md
export const TITLE_BAR_HEIGHT = '3.875rem';
export const LARGE_DESKTOP_MEDIA_QUERY =
  '@media screen and (min-width: 1440px) and (min-height: 900px)';

export const REDIRECT_ERROR_PARAM = 'redirectError';

export const TABLET_MEDIA_QUERY = `@media screen and (min-width: ${TABLET_BREAKPOINT})`;

export const MOBILE_MEDIA_QUERY = `@media screen and (max-width: ${DESKTOP_BREAKPOINT})`;

// This covers most laptops. It also covers very large tablets in landscape mode, but this is okay.
export const DESKTOP_MEDIA_QUERY = `@media screen and (min-width: ${DESKTOP_BREAKPOINT}) and (min-height: 821px)`;
