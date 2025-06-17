import MuiMenuIcon from '@material-ui/icons/Menu';
import React, { useState } from 'react';
import styled from 'styled-components';

import { IconButton } from '@tupaia/ui-components';

import { useIsMobile } from '../../utils';
import { DrawerMenu } from './DrawerMenu';
import { PopoverMenu } from './PopoverMenu';
import { UserInfo } from './UserInfo';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const MenuButton = styled(IconButton)`
  margin-left: 1rem;
`;

const MenuIcon = styled(MuiMenuIcon)`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 2rem;
`;

/**
 * This is the user menu that appears in the header of the app. It includes a drawer menu for mobile and a popover menu for desktop.
 */
export const UserMenu = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const onCloseMenu = () => setMenuOpen(false);
  const toggleUserMenu = () => setMenuOpen(!menuOpen);

  const Menu = useIsMobile() ? DrawerMenu : PopoverMenu;

  return (
    <Wrapper>
      <UserInfo />
      <MenuButton onClick={toggleUserMenu} id="user-menu-button" title="Toggle menu">
        <MenuIcon />
      </MenuButton>
      <Menu menuOpen={menuOpen} onCloseMenu={onCloseMenu} />
    </Wrapper>
  );
};
