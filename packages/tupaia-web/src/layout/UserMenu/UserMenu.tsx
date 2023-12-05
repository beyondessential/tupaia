/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import MuiMenuIcon from '@material-ui/icons/Menu';
import { IconButton, useTheme } from '@material-ui/core';
import styled from 'styled-components';
import { ErrorBoundary } from '@tupaia/ui-components';
import { MODAL_ROUTES } from '../../constants';
import { useLandingPage, useUser } from '../../api/queries';
import { useLogout } from '../../api/mutations';
import { PopoverMenu } from './PopoverMenu';
import { DrawerMenu } from './DrawerMenu';
import { MenuItem } from './MenuList';
import { UserInfo } from './UserInfo';

const UserMenuContainer = styled.div<{
  secondaryColor?: string;
}>`
  display: flex;
  align-items: center;
  border: 1px white;
  color: ${({ secondaryColor, theme }) => secondaryColor || theme.palette.text.primary};
`;

const MenuButton = styled(IconButton)`
  width: 3.125rem;
  height: 3.125rem;
`;

const MenuIcon = styled(MuiMenuIcon)`
  width: 100%;
  height: 100%;
`;

export const UserMenu = () => {
  const { mutate: logout } = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleUserMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const onCloseMenu = () => {
    setMenuOpen(false);
  };

  const theme = useTheme();
  const {
    isLandingPage,
    landingPage: { primaryHexcode, secondaryHexcode },
  } = useLandingPage();

  const { isLoggedIn, data } = useUser();

  // Create the menu items
  const BaseMenuItem = ({ children, ...props }: any) => (
    <MenuItem onCloseMenu={onCloseMenu} {...props} secondaryColor={secondaryHexcode}>
      {children}
    </MenuItem>
  );

  const VisitMainSite = (
    <BaseMenuItem key="mainSite" href="https://www.tupaia.org" externalLink>
      Visit&nbsp;<span>tupaia.org</span>
    </BaseMenuItem>
  );

  const Logout = (
    <BaseMenuItem key="logout" onClick={logout}>
      Log out
    </BaseMenuItem>
  );

  const ViewProjects = (
    <BaseMenuItem key="projects" modal={MODAL_ROUTES.PROJECTS}>
      View projects
    </BaseMenuItem>
  );

  const HelpCentre = (
    <BaseMenuItem
      key="help"
      externalLink
      href="https://beyond-essential.slab.com/topics/support-and-resources-g6piq0i1"
    >
      Help centre
    </BaseMenuItem>
  );

  const ChangePassword = (
    <BaseMenuItem key="changePassword" modal={MODAL_ROUTES.RESET_PASSWORD}>
      Change password
    </BaseMenuItem>
  );

  // The custom landing pages need different menu items to the other views
  const customLandingPageMenuItems = isLoggedIn
    ? [VisitMainSite, HelpCentre, ChangePassword, Logout]
    : [VisitMainSite, HelpCentre];

  const baseMenuItems = isLoggedIn
    ? [
        ViewProjects,
        HelpCentre,
        ChangePassword,
        <BaseMenuItem key="request-country-access" modal={MODAL_ROUTES.REQUEST_PROJECT_ACCESS}>
          Request country access
        </BaseMenuItem>,
        Logout,
      ]
    : [ViewProjects, HelpCentre];

  const menuItems = isLandingPage ? customLandingPageMenuItems : baseMenuItems;

  const menuPrimaryColor = primaryHexcode || theme.palette.background.default;
  const menuSecondaryColor = secondaryHexcode || theme.palette.text.primary;

  return (
    <ErrorBoundary>
      <UserMenuContainer>
        <UserInfo
          currentUserUsername={data?.name}
          isLoggedIn={isLoggedIn}
          isLandingPage={isLandingPage}
          secondaryColor={menuSecondaryColor}
        />
        <MenuButton onClick={toggleUserMenu} disableRipple id="user-menu-button">
          <MenuIcon />
        </MenuButton>
        {/** PopoverMenu is for larger (desktop size) screens, and DrawerMenu is for mobile screens. Each component takes care of the hiding and showing at different screen sizes. Eventually all the props will come from a context */}
        <PopoverMenu
          menuOpen={menuOpen}
          onCloseMenu={onCloseMenu}
          primaryColor={menuPrimaryColor}
          secondaryColor={menuSecondaryColor}
        >
          {menuItems}
        </PopoverMenu>
        <DrawerMenu
          menuOpen={menuOpen}
          onCloseMenu={onCloseMenu}
          isLoggedIn={isLoggedIn}
          primaryColor={menuPrimaryColor}
          secondaryColor={menuSecondaryColor}
          currentUserUsername={data?.name}
        >
          {menuItems}
        </DrawerMenu>
      </UserMenuContainer>
    </ErrorBoundary>
  );
};
