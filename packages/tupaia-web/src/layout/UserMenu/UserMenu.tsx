/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode, useState } from 'react';
import MuiMenuIcon from '@material-ui/icons/Menu';
import { Button, MenuList } from '@material-ui/core';
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

  // Here will be the menu items logic
  const menuItems = [] as ReactNode[];

  return (
    <UserMenuContainer>
      <MenuButton onClick={toggleUserMenu} disableRipple id="user-menu-button">
        <MenuIcon />
      </MenuButton>
      {/** PopoverMenu is for larger (desktop size) screens, and DrawerMenu is for mobile screens. Each component takes care of the hiding and showing at different screen sizes */}
      <PopoverMenu menuOpen={menuOpen} onCloseMenu={onCloseMenu}>
        {menuItems}
      </PopoverMenu>
      <DrawerMenu
        menuOpen={menuOpen}
        onCloseMenu={onCloseMenu}
        onClickRegister={() => {}}
        onClickSignIn={() => {}}
        isUserLoggedIn={false}
      >
        {menuItems}
      </DrawerMenu>
    </UserMenuContainer>
  );
};
