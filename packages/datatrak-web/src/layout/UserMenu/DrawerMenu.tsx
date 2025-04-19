import { Drawer, Paper as MuiPaper } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import React from 'react';
import styled from 'styled-components';

import { IconButton, RouterLink } from '@tupaia/ui-components';

import { useCurrentUserContext } from '../../api';
import { ROUTES } from '../../constants';
import { MenuButton, MenuList } from './MenuList';

const Paper = styled(MuiPaper)`
  border-radius: 0;
  min-inline-size: 70dvi;
  padding-inline: 1rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding-inline: 1.5rem;
  }
`;

const MenuHeader = styled.div`
  border-block-end: max(0.0625rem, 1px) solid ${({ theme }) => theme.palette.text.primary};
  position: relative;
  padding: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const MenuCloseIcon = styled(CloseIcon)`
  &.MuiSvgIcon-root {
    font-size: 1.8rem;
  }
`;

const CloseButton = styled(IconButton).attrs({
  color: 'default',
})`
  color: ${props => props.theme.palette.text.primary};
  padding: 0.8rem;
`;

interface DrawerMenuProps {
  menuOpen: boolean;
  onCloseMenu: () => void;
}

export const DrawerMenu = ({ menuOpen, onCloseMenu }: DrawerMenuProps) => {
  const user = useCurrentUserContext();
  // When not logged in, show the login and register buttons in the drawer menu

  const getAdditionalMenuItems = () => {
    if (user.isLoggedIn) {
      return [];
    }
    return [
      {
        label: 'Log in',
        to: ROUTES.LOGIN,
      },
      {
        label: 'Register',
        to: ROUTES.REGISTER,
      },
    ];
  };
  const additionalMenuItems = getAdditionalMenuItems();
  return (
    <Drawer
      anchor="right"
      open={menuOpen}
      onClose={onCloseMenu}
      PaperProps={{ component: Paper }}
      disablePortal
    >
      <MenuHeader>
        <CloseButton onClick={onCloseMenu}>
          <MenuCloseIcon />
        </CloseButton>
      </MenuHeader>
      <MenuList onCloseMenu={onCloseMenu}>
        {additionalMenuItems.map(({ label, to }) => (
          <MenuButton key={label} to={to} component={RouterLink} onClick={onCloseMenu}>
            {label}
          </MenuButton>
        ))}
      </MenuList>
    </Drawer>
  );
};
