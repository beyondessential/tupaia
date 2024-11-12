/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';

export const ArrowLeftIcon = ({ htmlColor = 'currentColor', ...props }: SvgIconProps) => {
  return (
    <SvgIcon
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4.28954 9.99976C4.28954 9.68727 4.41516 9.38789 4.63954 9.16727L13.5883 0.343591C14.0545 -0.114531 14.8095 -0.114531 15.2752 0.343592C15.7408 0.802963 15.7408 1.54983 15.2752 2.00733L7.16891 9.99977L15.2758 17.991C15.7414 18.4509 15.7414 19.1966 15.2758 19.6559C14.8102 20.1147 14.0552 20.1147 13.5889 19.6559L4.63891 10.8323C4.41516 10.6104 4.28954 10.311 4.28954 9.99976Z"
        fill={htmlColor}
      />
    </SvgIcon>
  );
};
