/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import MuiMenuIcon from '@material-ui/icons/Menu';
import { Button, useTheme } from '@material-ui/core';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { useLandingPage, useUser } from '../../api/queries';
import { PopoverMenu } from './PopoverMenu';
import { DrawerMenu } from './DrawerMenu';
import { MenuItem } from './MenuList';
import { USER_ROUTES } from '../../constants';
import { UserInfo } from './UserInfo';

const UserMenuContainer = styled.div<{
  secondaryColor?: string;
}>`
  display: flex;
  align-items: center;
  color: ${({ secondaryColor, theme }) => secondaryColor || theme.palette.text.primary};
`;

const MenuButton = styled(Button)`
  width: 2em;
  min-width: 2em;
  height: 2em;
  text-align: right;
  padding: 0;
`;

const MenuIcon = styled(MuiMenuIcon)`
  width: 100%;
  height: 100%;
`;

export const UserMenu = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleUserMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const onCloseMenu = () => {
    setMenuOpen(false);
  };

  const { landingPageUrlSegment } = useParams();
  const theme = useTheme();
  const {
    isLandingPage,
    landingPage: { primaryHexcode, secondaryHexcode },
  } = useLandingPage(landingPageUrlSegment);

  const { isLoggedIn, data } = useUser();

  // Create the menu items
  const BaseMenuItem = ({ children, ...props }: any) => (
    <MenuItem onCloseMenu={onCloseMenu} {...props} secondaryColor={secondaryHexcode}>
      {children}
    </MenuItem>
  );

  const VisitMainSite = (
    <BaseMenuItem href="https://www.tupaia.org">
      Visit&nbsp;<span>tupaia.org</span>
    </BaseMenuItem>
  );

  const ViewProjects = (
    <BaseMenuItem key="projects" href={`?modal=${USER_ROUTES.PROJECTS}`}>
      View projects
    </BaseMenuItem>
  );

  const ChangePassword = (
    <BaseMenuItem href={USER_ROUTES.RESET_PASSWORD}>Change password</BaseMenuItem>
  );
  // The custom landing pages need different menu items to the other views
  const customLandingPageMenuItems = isLoggedIn ? [VisitMainSite, ChangePassword] : [VisitMainSite];

  const baseMenuItems = [ViewProjects];

  const menuItems = isLandingPage ? customLandingPageMenuItems : baseMenuItems;

  const menuPrimaryColor = primaryHexcode || theme.palette.background.default;
  const menuSecondaryColor = secondaryHexcode || theme.palette.text.primary;

  return (
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
        currentUserUsername={''}
      >
        {menuItems}
      </DrawerMenu>
    </UserMenuContainer>
  );
};
