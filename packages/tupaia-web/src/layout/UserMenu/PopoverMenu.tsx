import { Popover } from '@material-ui/core';
import React from 'react';
import { MenuList } from './MenuList';

/**
 * PopoverMenu is a popover menu used when the user is on a desktop device
 * (mounted only above the mobile breakpoint — see UserMenu).
 */

interface PopoverMenuProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Popover>,
    'open' | 'onClose' | 'anchorEl' | 'anchorOrigin' | 'transformOrigin' | 'PaperProps'
  > {
  anchorElRef: React.RefObject<HTMLElement>;
  primaryColor?: string;
  secondaryColor?: string;
  menuOpen: boolean;
  onCloseMenu: () => void;
}

export const PopoverMenu = ({
  anchorElRef,
  children,
  primaryColor,
  menuOpen,
  onCloseMenu,
  secondaryColor,
  ...props
}: PopoverMenuProps) => {
  return (
    <Popover
      {...props}
      PaperProps={{
        style: {
          backgroundColor: primaryColor,
        },
      }}
      open={menuOpen}
      anchorEl={anchorElRef.current}
      onClose={onCloseMenu}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <MenuList secondaryColor={secondaryColor}>{children}</MenuList>
    </Popover>
  );
};
