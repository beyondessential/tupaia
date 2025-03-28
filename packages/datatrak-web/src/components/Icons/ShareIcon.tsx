import React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';

export const ShareIcon = ({ htmlColor = 'currentColor', ...props }: SvgIconProps) => {
  return (
    <SvgIcon
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="27"
      height="27"
      viewBox="0 0 27 27"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22.5 16.0312C22.966 16.0312 23.3437 16.409 23.3437 16.875L23.3437 20.25C23.3437 21.9586 21.9586 23.3437 20.25 23.3437L6.75 23.3437C5.04137 23.3437 3.65625 21.9586 3.65625 20.25L3.65625 16.875C3.65625 16.409 4.03401 16.0312 4.5 16.0312C4.96599 16.0312 5.34375 16.409 5.34375 16.875L5.34375 20.25C5.34375 21.0267 5.97335 21.6562 6.75 21.6562L20.25 21.6562C21.0266 21.6562 21.6562 21.0267 21.6562 20.25L21.6562 16.875C21.6562 16.409 22.034 16.0312 22.5 16.0312ZM18.5966 9.59662C18.2671 9.92613 17.7329 9.92613 17.4034 9.59662L14.3438 6.53699L14.3437 18C14.3437 18.466 13.966 18.8437 13.5 18.8437C13.034 18.8437 12.6562 18.466 12.6562 18L12.6562 6.53699L9.59662 9.59662C9.26712 9.92613 8.73288 9.92613 8.40338 9.59662C8.07387 9.26712 8.07387 8.73288 8.40338 8.40338L12.9034 3.90338C13.0616 3.74514 13.2762 3.65625 13.5 3.65625C13.7238 3.65625 13.9384 3.74514 14.0966 3.90338L18.5966 8.40338C18.9261 8.73288 18.9261 9.26712 18.5966 9.59662Z"
        fill={htmlColor}
      />
    </SvgIcon>
  );
};
