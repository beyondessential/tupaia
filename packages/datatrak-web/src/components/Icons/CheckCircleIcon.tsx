import { SvgIcon, SvgIconProps } from '@material-ui/core';
import React from 'react';

export const CheckCircleIcon = ({ htmlColor = 'currentColor', ...props }: SvgIconProps) => (
  <SvgIcon
    width={25}
    height={25}
    viewBox="0 0 25 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12.5 0C5.625 0 0 5.625 0 12.5C0 19.375 5.625 25 12.5 25C19.375 25 25 19.375 25 12.5C25 5.625 19.375 0 12.5 0ZM19.4792 9.0625L11.1458 17.3958C10.9375 17.6042 10.7292 17.7083 10.4167 17.7083C10.1042 17.7083 9.89583 17.6042 9.6875 17.3958L5.52083 13.2292C5.10417 12.8125 5.10417 12.1875 5.52083 11.7708C5.9375 11.3542 6.5625 11.3542 6.97917 11.7708L10.4167 15.2083L18.0208 7.60417C18.4375 7.1875 19.0625 7.1875 19.4792 7.60417C19.8958 8.02083 19.8958 8.64583 19.4792 9.0625Z"
      fill={htmlColor}
    />
  </SvgIcon>
);
