import { SvgIcon, SvgIconProps } from '@material-ui/core';
import React from 'react';

interface HomeIconProps extends SvgIconProps {
  variant?: 'filled' | 'outlined';
}

/**
 * @privateRemarks This is the `description` Material Symbol, but Material UI only supports the
 * legacy Material Icons. The <path>s are equivalent to using the icon font with:
 *
 * ```
 * font-variation-settings: 'wght' 400, 'GRAD' 0, 'opsz' 24;
 * ```
 */
export const Description = ({ variant = 'filled', ...props }: HomeIconProps) => (
  <SvgIcon
    fill="currentColor"
    height="24"
    viewBox="0 -960 960 960"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {variant === 'filled' ? (
      <path d="M360-240h240q17 0 28.5-11.5T640-280q0-17-11.5-28.5T600-320H360q-17 0-28.5 11.5T320-280q0 17 11.5 28.5T360-240Zm0-160h240q17 0 28.5-11.5T640-440q0-17-11.5-28.5T600-480H360q-17 0-28.5 11.5T320-440q0 17 11.5 28.5T360-400ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h287q16 0 30.5 6t25.5 17l194 194q11 11 17 25.5t6 30.5v447q0 33-23.5 56.5T720-80H240Zm280-560q0 17 11.5 28.5T560-600h160L520-800v160Z" />
    ) : (
      <path d="M360-240h240q17 0 28.5-11.5T640-280q0-17-11.5-28.5T600-320H360q-17 0-28.5 11.5T320-280q0 17 11.5 28.5T360-240Zm0-160h240q17 0 28.5-11.5T640-440q0-17-11.5-28.5T600-480H360q-17 0-28.5 11.5T320-440q0 17 11.5 28.5T360-400ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h287q16 0 30.5 6t25.5 17l194 194q11 11 17 25.5t6 30.5v447q0 33-23.5 56.5T720-80H240Zm280-560v-160H240v640h480v-440H560q-17 0-28.5-11.5T520-640ZM240-800v200-200 640-640Z" />
    )}
  </SvgIcon>
);
