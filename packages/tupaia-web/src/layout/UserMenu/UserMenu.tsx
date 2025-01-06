/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import MuiMenuIcon from '@material-ui/icons/Menu';
import { IconButton, useTheme } from '@material-ui/core';
import styled from 'styled-components';
import { ErrorBoundary } from '@tupaia/ui-components';
import { useLandingPage, useUser } from '../../api/queries';
import { useLogout } from '../../api/mutations';
import { MODAL_ROUTES } from '../../constants';
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

  const { data: user, isLoggedIn } = useUser();

  // Create the menu items
  const BaseMenuItem = ({ children, ...props }: any) => (
    <MenuItem onCloseMenu={onCloseMenu} {...props} secondaryColor={secondaryHexcode}>
      {children}
    </MenuItem>
  );

  const VisitMainSite = (
    <BaseMenuItem key="mainSite" href="https://www.tupaia.org" externalLink>
      Visit tupaia.org
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

  const datatrakUrl = process.env.REACT_APP_DATATRAK_REDIRECT_URL || 'https://datatrak.tupaia.org';
  const SubmitData = (
    <BaseMenuItem key="submitData" href={datatrakUrl} externalLink>
      Submit data
    </BaseMenuItem>
  );

  const SupportCentre = (
    <BaseMenuItem externalLink href="https://bes-support.zendesk.com" key="support">
      Support centre
    </BaseMenuItem>
  );

  const ChangePassword = (
    <BaseMenuItem key="changePassword" modal={MODAL_ROUTES.RESET_PASSWORD}>
      Change password
    </BaseMenuItem>
  );

  const RequestCountryAccess = (
    <BaseMenuItem key="request-country-access" modal={MODAL_ROUTES.REQUEST_PROJECT_ACCESS}>
      Request country access
    </BaseMenuItem>
  );

  // The custom landing pages need different menu items to the other views
  const customLandingPageMenuItems = isLoggedIn
    ? [VisitMainSite, SupportCentre, ChangePassword, Logout]
    : [VisitMainSite, SupportCentre];

  const baseMenuItems = isLoggedIn
    ? [ViewProjects, SubmitData, SupportCentre, ChangePassword, RequestCountryAccess, Logout]
    : [ViewProjects, SubmitData, SupportCentre];

  const menuItems = isLandingPage ? customLandingPageMenuItems : baseMenuItems;

  const menuPrimaryColor = primaryHexcode || theme.palette.background.default;
  const menuSecondaryColor = secondaryHexcode || theme.palette.text.primary;

  return (
    <ErrorBoundary>
      <UserMenuContainer>
        <UserInfo
          user={user}
          isLoggedIn={isLoggedIn}
          isLandingPage={isLandingPage}
          secondaryColor={menuSecondaryColor}
        />
        <MenuButton
          onClick={toggleUserMenu}
          disableRipple
          id="user-menu-button"
          title="Toggle menu"
        >
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
          currentUser={user}
        >
          {menuItems}
        </DrawerMenu>
      </UserMenuContainer>
    </ErrorBoundary>
  );
};
