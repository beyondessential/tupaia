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
import { Button } from '../../components';

const Drawer = styled(MuiDrawer)`
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const Paper = styled(MuiPaper)`
  min-width: 70vw;
  border-radius: 0;
  padding: 0 1rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding: 0 1.5rem;
  }
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

const UserDetails = styled.div`
  width: 100%;
  padding: 0.5rem;
`;

const UserName = styled(Typography)`
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const UserProject = styled(Button).attrs({
  variant: 'text',
})`
  color: ${props => props.theme.palette.text.secondary};
  font-weight: 400;
  padding: 0;
  &:hover,
  &:focus {
    text-decoration: underline;
  }
`;

interface DrawerMenuProps {
  menuOpen: boolean;
  onCloseMenu: () => void;
  openProjectModal: () => void;
}
export const DrawerMenu = ({ menuOpen, onCloseMenu, openProjectModal }: DrawerMenuProps) => {
  const { isLoggedIn, data: user } = useUser();
  // When not logged in, show the login and register buttons in the drawer menu

  const getAdditionalMenuItems = () => {
    if (isLoggedIn) {
      return [];
    }
    return [
      {
        label: 'Login',
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
        <UserDetails>
          {user?.name && <UserName>{user.name}</UserName>}
          {user?.project?.name && (
            <UserProject onClick={openProjectModal} title="Change project">
              {user.project.name}
            </UserProject>
          )}
        </UserDetails>
        <CloseButton onClick={onCloseMenu}>
          <MenuCloseIcon />
        </CloseButton>
      </MenuHeader>
      <MenuList onCloseMenu={onCloseMenu}>
        {additionalMenuItems.map(({ label, to }) => (
          <MenuButton key={label} to={to} component={RouterLink}>
            {label}
          </MenuButton>
        ))}
      </MenuList>
    </Drawer>
  );
};
