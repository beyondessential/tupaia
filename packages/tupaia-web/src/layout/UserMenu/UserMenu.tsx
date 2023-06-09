/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode, useState } from 'react';
import MuiMenuIcon from '@material-ui/icons/Menu';
import { Button } from '@material-ui/core';
import styled from 'styled-components';
import { PopoverMenu } from './PopoverMenu';
import { DrawerMenu } from './DrawerMenu';
import { useLandingPage } from '../../api';
import { useParams } from 'react-router';
import { useTheme } from '@material-ui/core';
import { MenuItem } from './MenuList';
import { USER_ROUTES } from '../../Routes';
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
  pointer-events: auto;
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

  // this will come from login state
  const isUserLoggedIn = false;

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

  const ChangePassword = (
    <BaseMenuItem onClick={USER_ROUTES.RESET_PASSWORD}>Change password</BaseMenuItem>
  );
  // The custom landing pages need different menu items to the other views
  const customLandingPageMenuItems = isUserLoggedIn
    ? [VisitMainSite, ChangePassword]
    : [VisitMainSite];

  const baseMenuItems = [] as ReactNode[];

  const menuItems = isLandingPage ? customLandingPageMenuItems : baseMenuItems;

  const menuPrimaryColor = primaryHexcode || theme.palette.background.default;
  const menuSecondaryColor = secondaryHexcode || theme.palette.text.primary;

  return (
    <UserMenuContainer>
      <UserInfo
        currentUserUsername={''}
        isUserLoggedIn={isUserLoggedIn}
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
        isUserLoggedIn={isUserLoggedIn}
        primaryColor={menuPrimaryColor}
        secondaryColor={menuSecondaryColor}
        currentUserUsername={''}
      >
        {menuItems}
      </DrawerMenu>
    </UserMenuContainer>
  );
};
