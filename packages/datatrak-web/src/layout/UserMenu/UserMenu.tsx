/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import MuiMenuIcon from '@material-ui/icons/Menu';
import { IconButton } from '@tupaia/ui-components';
import { DrawerMenu } from './DrawerMenu';
import { PopoverMenu } from './PopoverMenu';
import { UserInfo } from './UserInfo';
import { ProjectSelectModal } from './ProjectSelectModal';

const Wrapper = styled.div`
  display: flex;
  align-items: center;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    justify-content: space-between;
    width: 100%;
  }
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
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const openProjectModal = () => setProjectModalOpen(true);
  const closeProjectModal = () => setProjectModalOpen(false);

  const onCloseMenu = () => setMenuOpen(false);
  const toggleUserMenu = () => setMenuOpen(!menuOpen);

  return (
    <Wrapper>
      <UserInfo />
      <MenuButton onClick={toggleUserMenu} id="user-menu-button" title="Toggle menu">
        <MenuIcon />
      </MenuButton>
      <PopoverMenu menuOpen={menuOpen} onCloseMenu={onCloseMenu} />
      <DrawerMenu
        menuOpen={menuOpen}
        onCloseMenu={onCloseMenu}
        openProjectModal={openProjectModal}
      />
      {projectModalOpen && <ProjectSelectModal onBack={closeProjectModal} />}
    </Wrapper>
  );
};
