import React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';

export const PinIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      {...props}
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1278_17766)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.82386 6.23135L7.20341 4.61089L7.5275 4.2868C7.70575 4.10855 7.70575 3.81687 7.5275 3.63862C7.34925 3.46037 7.05757 3.46037 6.87932 3.63862L3.63842 6.87953C3.46017 7.05778 3.46017 7.34946 3.63842 7.52771C3.81667 7.70596 4.10835 7.70596 4.2866 7.52771L4.61069 7.20362L6.23114 8.82407C6.76913 9.36206 6.76913 10.2306 6.23114 10.7686L6.87932 11.4168L8.81414 9.48198L11.0828 11.7506L11.731 11.7506L11.731 11.1024L9.46232 8.8338L11.4166 6.87953L10.7684 6.23135C10.2304 6.76934 9.36186 6.76934 8.82386 6.23135Z"
          fill="#2E2F33"
        />
      </g>
      <defs>
        <clipPath id="clip0_1278_17766">
          <rect
            width="11"
            height="11"
            fill="white"
            transform="translate(0.72168 8.5) rotate(-45)"
          />
        </clipPath>
      </defs>
    </SvgIcon>
  );
};
