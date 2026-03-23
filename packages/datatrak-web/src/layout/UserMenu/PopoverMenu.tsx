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
  anchorId?: string;
  menuOpen: boolean;
  onCloseMenu: () => void;
  surveyGuard?: (onConfirm: () => void) => void;
}
/**
 * This is the desktop popover user menu
 */
export const PopoverMenu = ({
  anchorId = 'user-menu-button',
  menuOpen,
  onCloseMenu,
  surveyGuard,
}: PopoverMenuProps) => {
  return (
    <Popover
      open={menuOpen}
      PaperProps={{
        component: Paper,
      }}
      anchorEl={() => document.getElementById(anchorId) as HTMLElement}
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
      <MenuList onCloseMenu={onCloseMenu} surveyGuard={surveyGuard} />
    </Popover>
  );
};
