import { useMediaQuery, useTheme } from '@material-ui/core';

export const useIsMobileMediaQuery = () => {
  const theme = useTheme();
  // this is something we use for small screens most of the time, for styling purposes, so it is safe to include a media query here
  return useMediaQuery(theme.breakpoints.down('sm'));
};
