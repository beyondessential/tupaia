/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Drawer as MuiDrawer, Paper as MuiPaper, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { MOBILE_BREAKPOINT, ROUTES } from '../../constants';
import { IconButton, RouterLink } from '@tupaia/ui-components';
import { MenuButton, MenuList } from './MenuList';
import { useUser } from '../../api/queries';

const Drawer = styled(MuiDrawer)`
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const Paper = styled(MuiPaper)`
  min-width: 70vw;
  border-radius: 0;
  padding: 0 1.5rem;
`;

const MenuHeader = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.palette.text.primary};
  position: relative;
  padding: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const MenuCloseIcon = styled(CloseIcon)`
  width: 1.2em;
  height: 1.2em;
`;

const CloseButton = styled(IconButton).attrs({
  color: 'default',
  disableRipple: true,
})`
  padding: 0.8rem;
`;

const UserName = styled(Typography)`
  width: 100%;
  color: ${({ theme }) => theme.palette.text.secondary};
  padding-left: 0.5rem;
`;

interface DrawerMenuProps {
  menuOpen: boolean;
  onCloseMenu: () => void;
}
export const DrawerMenu = ({ menuOpen, onCloseMenu }: DrawerMenuProps) => {
  const { isLoggedIn, data } = useUser();
  // When not logged in, show the login and register buttons in the drawer menu
  const additionalMenuItems = isLoggedIn
    ? []
    : [
        {
          label: 'Login',
          to: ROUTES.LOGIN,
        },
        {
          label: 'Register',
          to: ROUTES.REGISTER,
        },
      ];
  return (
    <Drawer
      anchor="right"
      open={menuOpen}
      onClose={onCloseMenu}
      PaperProps={{ component: Paper }}
      disablePortal
    >
      <MenuHeader>
        {/** When logged in, show the user name at the top of the drawer menu */}
        {isLoggedIn && <UserName>{data?.name}</UserName>}
        <CloseButton onClick={onCloseMenu}>
          <MenuCloseIcon />
        </CloseButton>
      </MenuHeader>
      <MenuList>
        {additionalMenuItems.map(({ label, to }) => (
          <MenuButton key={label} to={to} component={RouterLink}>
            {label}
          </MenuButton>
        ))}
      </MenuList>
    </Drawer>
  );
};
