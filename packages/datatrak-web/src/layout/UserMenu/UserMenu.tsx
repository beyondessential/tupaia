import React, { useState } from 'react';
import styled from 'styled-components';
import MuiMenuIcon from '@material-ui/icons/Menu';
import { IconButton } from '@tupaia/ui-components';
import { PopoverMenu } from './PopoverMenu';
import { UserInfo } from './UserInfo';
import { useIsMobile } from '../../utils';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const MenuButton = styled(IconButton).attrs({
  disableRipple: true,
})`
  margin-left: 1rem;
`;

const MenuIcon = styled(MuiMenuIcon)`
  color: ${({ theme }) => theme.palette.text.primary};
  width: 2rem;
  height: 2rem;
`;

/**
 * This is the user menu that appears in the header of the app. It includes a drawer menu for mobile and a popover menu for desktop.
 */
export const UserMenu = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const onCloseMenu = () => setMenuOpen(false);
  const toggleUserMenu = () => setMenuOpen(!menuOpen);
  const isDesktop = !useIsMobile();

  return (
    <Wrapper>
      <UserInfo />
      {isDesktop && (
        <>
          <MenuButton onClick={toggleUserMenu} id="user-menu-button" title="Toggle menu">
            <MenuIcon />
          </MenuButton>
          <PopoverMenu menuOpen={menuOpen} onCloseMenu={onCloseMenu} />
        </>
      )}
    </Wrapper>
  );
};
