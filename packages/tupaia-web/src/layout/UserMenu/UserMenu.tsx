/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode, useState } from 'react';
import MuiMenuIcon from '@material-ui/icons/Menu';
import { Button, MenuList, useTheme } from '@material-ui/core';
import styled from 'styled-components';
import { PopoverMenu } from './PopoverMenu';
import { DrawerMenu } from './DrawerMenu';

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

  // Here will be the menu items logic. These will probably come from a context somewhere that handles when a user is logged in, and when it is a custom landing page
  const menuItems = [] as ReactNode[];

  const theme = useTheme();

  // these will later be updated to handle custom landing pages
  const primaryColor = theme.palette.background.default;
  const secondaryColor = theme.palette.text.primary;

  return (
    <UserMenuContainer>
      <MenuButton onClick={toggleUserMenu} disableRipple id="user-menu-button">
        <MenuIcon />
      </MenuButton>
      {/** PopoverMenu is for larger (desktop size) screens, and DrawerMenu is for mobile screens. Each component takes care of the hiding and showing at different screen sizes. Eventually all the props will come from a context */}
      <PopoverMenu
        menuOpen={menuOpen}
        onCloseMenu={onCloseMenu}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      >
        {menuItems}
      </PopoverMenu>
      <DrawerMenu
        menuOpen={menuOpen}
        onCloseMenu={onCloseMenu}
        isUserLoggedIn={false}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      >
        {menuItems}
      </DrawerMenu>
    </UserMenuContainer>
  );
};
