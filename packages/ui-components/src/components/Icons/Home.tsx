import { SvgIcon, SvgIconProps } from '@material-ui/core';
import React from 'react';

interface HomeIconProps extends SvgIconProps {
  variant?: 'filled' | 'outlined';
}

/**
 * @privateRemarks This is the `home` Material Symbol, but Material UI only supports the legacy
 * Material Icons. The <path>s are equivalent to using the icon font with:
 *
 * ```
 * font-variation-settings: 'wght' 400, 'GRAD' 0, 'opsz' 24;
 * ```
 */
export const Home = ({ variant = 'filled', ...props }: HomeIconProps) => (
  <SvgIcon
    fill="currentColor"
    height="24"
    viewBox="0 -960 960 960"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {variant === 'filled' ? (
      <path d="M160-200v-360q0-19 8.5-36t23.5-28l240-180q21-16 48-16t48 16l240 180q15 11 23.5 28t8.5 36v360q0 33-23.5 56.5T720-120H600q-17 0-28.5-11.5T560-160v-200q0-17-11.5-28.5T520-400h-80q-17 0-28.5 11.5T400-360v200q0 17-11.5 28.5T360-120H240q-33 0-56.5-23.5T160-200Z" />
    ) : (
      <path d="M240-200h120v-200q0-17 11.5-28.5T400-440h160q17 0 28.5 11.5T600-400v200h120v-360L480-740 240-560v360Zm-80 0v-360q0-19 8.5-36t23.5-28l240-180q21-16 48-16t48 16l240 180q15 11 23.5 28t8.5 36v360q0 33-23.5 56.5T720-120H560q-17 0-28.5-11.5T520-160v-200h-80v200q0 17-11.5 28.5T400-120H240q-33 0-56.5-23.5T160-200Zm320-270Z" />
    )}
  </SvgIcon>
);
