import { Paper as MuiPaper, Popover } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';

import { MenuList } from './MenuList';

const Paper = styled(MuiPaper)`
  inline-size: 14rem;
  padding-block: 0;
  padding-inline: 0.4rem;
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
      <MenuList onCloseMenu={onCloseMenu} />
    </Popover>
  );
};
