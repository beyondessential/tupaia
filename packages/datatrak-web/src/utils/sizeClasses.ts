import { useMediaQuery, useTheme } from '@material-ui/core';

/**
 * Thin wrapper around {@link useMediaQuery}, but returns `undefined` until the true value has
 * settled.
 */
export const useIsMobileSizeClass = (): boolean | undefined => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  return isMobile === isDesktop // Both report false negative until hydration
    ? undefined
    : isMobile;
};

/**
 * Thin wrapper around {@link useMediaQuery}, but returns `undefined` until the true value has
 * settled.
 */
export const useIsDesktopSizeClass = (): boolean | undefined => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  return isMobile === isDesktop // Both report false negative until hydration
    ? undefined
    : isDesktop;
};
