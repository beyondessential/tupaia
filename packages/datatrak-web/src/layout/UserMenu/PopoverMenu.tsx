/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Popover as MuiPopover, Paper as MuiPaper } from '@material-ui/core';
import { MOBILE_BREAKPOINT } from '../../constants';
import { MenuList } from './MenuList';

/**
 * PopoverMenu is a popover menu used when the user is on a desktop device
 */

const Popover = styled(MuiPopover)`
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const Paper = styled(MuiPaper)`
  width: 14rem;
  padding: 0 0.4rem;
`;

interface PopoverMenuProps {
  menuOpen: boolean;
  onCloseMenu: () => void;
}
/**
 * This is the desktop popover user menu
 */
export const PopoverMenu = ({ menuOpen, onCloseMenu }: PopoverMenuProps) => {
  return (
    <Popover
      open={menuOpen}
      disablePortal
      PaperProps={{
        component: Paper,
      }}
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
      <MenuList />
    </Popover>
  );
};
