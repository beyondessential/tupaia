import React, { ReactNode } from 'react';
import { Popover as MuiPopover } from '@material-ui/core';
import { MenuList } from './MenuList';
import styled from 'styled-components';
import { MOBILE_BREAKPOINT } from '../../constants';

/**
 * PopoverMenu is a popover menu used when the user is on a desktop device
 */

const Popover = styled(MuiPopover)`
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

interface PopoverMenuProps {
  children: ReactNode;
  primaryColor?: string;
  secondaryColor?: string;
  menuOpen: boolean;
  onCloseMenu: () => void;
}
export const PopoverMenu = ({
  children,
  primaryColor,
  menuOpen,
  onCloseMenu,
  secondaryColor,
}: PopoverMenuProps) => {
  return (
    <Popover
      PaperProps={{
        style: {
          backgroundColor: primaryColor,
        },
      }}
      open={menuOpen}
      anchorEl={() => document.getElementById('user-menu-button') as HTMLElement}
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
