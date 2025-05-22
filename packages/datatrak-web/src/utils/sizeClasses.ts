import { useMediaQuery, useTheme } from '@material-ui/core';

export const useIsMobileSizeClass = () => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('sm'));
};

export const useIsDesktopSizeClass = () => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up('md'));
};
