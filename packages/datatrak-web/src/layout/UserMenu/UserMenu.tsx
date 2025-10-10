import MuiMenuIcon from '@material-ui/icons/Menu';
import React, { useState } from 'react';
import styled from 'styled-components';

import { IconButton } from '@tupaia/ui-components';

import { useIsDesktop } from '../../utils';
import { PopoverMenu } from './PopoverMenu';
import { UserInfo } from './UserInfo';
import { SyncButton } from '../Header/SyncButton';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
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
  const isDesktop = useIsDesktop();

  return (
    <Wrapper>
      <UserInfo />
      <SyncButton />
      {isDesktop && (
        <>
          <IconButton onClick={toggleUserMenu} id="user-menu-button" title="Toggle menu" disableRipple>
            <MenuIcon />
          </IconButton>
          <PopoverMenu menuOpen={menuOpen} onCloseMenu={onCloseMenu} />
        </>
      )}
    </Wrapper>
  );
};
