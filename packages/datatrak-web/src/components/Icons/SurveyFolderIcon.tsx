import React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';

export const SurveyFolderIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      {...props}
      width="15"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.73082 0.00150486C5.30774 0.00146484 6.23082 1.53997 6.69235 1.84766C4.46159 3.73227 0.0231237 6.73997 0.115431 3.69381C0.207739 0.647659 1.53851 -0.0369567 2.19235 0.00150486H4.73082Z"
        fill="#328DE5"
      />
      <rect y="1.84766" width="12" height="10.1538" rx="2.49969" fill="#D9E8F8" />
      <line
        x1="3.26917"
        y1="7.57843"
        x2="8.9616"
        y2="7.57843"
        stroke="#328DE5"
        strokeWidth="0.999878"
        strokeLinecap="round"
      />
    </SvgIcon>
  );
};
