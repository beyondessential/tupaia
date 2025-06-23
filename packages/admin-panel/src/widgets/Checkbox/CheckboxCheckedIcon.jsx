import React from 'react';
import { SvgIcon, useTheme } from '@material-ui/core';

export const CheckboxCheckedIcon = props => {
  const theme = useTheme();
  return (
    <SvgIcon
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="checkbox"
      {...props}
    >
      <rect x="0.5" y="0.5" width="14" height="14" rx="2.5" stroke={theme.palette.grey['400']} />
      <rect x="0.5" y="0.5" width="14" height="14" rx="2.5" stroke={theme.palette.primary.main} />
      <path
        d="M10.85 5.85L6.85 9.85C6.75 9.95 6.65 10 6.5 10C6.35 10 6.25 9.95 6.15 9.85L4.15 7.85C3.95 7.65 3.95 7.35 4.15 7.15C4.35 6.95 4.65 6.95 4.85 7.15L6.5 8.8L10.15 5.15C10.35 4.95 10.65 4.95 10.85 5.15C11.05 5.35 11.05 5.65 10.85 5.85Z"
        fill={theme.palette.primary.main}
      />
    </SvgIcon>
  );
};
