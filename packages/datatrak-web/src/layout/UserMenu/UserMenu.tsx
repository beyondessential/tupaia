import React, { useState } from 'react';
import { useLocation } from 'react-router';
import styled from 'styled-components';
import MuiMenuIcon from '@material-ui/icons/Menu';

import { IconButton } from '@tupaia/ui-components';

import { useIsDesktop } from '../../utils';
import { PopoverMenu } from './PopoverMenu';
import { UserInfo } from './UserInfo';
import { SyncButton } from '../Header/SyncButton';
import { ROUTES } from '../../constants';
import { useIsOfflineFirst } from '../../api/offlineFirst';

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
  const location = useLocation();
  const isOfflineFirst = useIsOfflineFirst();
  const isSyncPage = location.pathname === ROUTES.SYNC;

  return (
    <Wrapper>
      <UserInfo />
      {!isSyncPage && isOfflineFirst && <SyncButton />}
      {isDesktop && (
        <>
          <IconButton
            onClick={toggleUserMenu}
            id="user-menu-button"
            title="Toggle menu"
            disableRipple
          >
            <MenuIcon />
          </IconButton>
          <PopoverMenu menuOpen={menuOpen} onCloseMenu={onCloseMenu} />
        </>
      )}
    </Wrapper>
  );
};
