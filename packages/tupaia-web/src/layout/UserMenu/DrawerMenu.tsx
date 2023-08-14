/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Drawer as MuiDrawer } from '@material-ui/core';
import { IconButton } from '@tupaia/ui-components';
import CloseIcon from '@material-ui/icons/Close';
import { MenuItem, MenuList } from './MenuList';
import { MOBILE_BREAKPOINT, MODAL_ROUTES } from '../../constants';

/**
 * DrawerMenu is a drawer menu used when the user is on a mobile device
 */

const Drawer = styled(MuiDrawer)`
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const MenuWrapper = styled.div`
  padding: 0 1.5em;
  li a,
  li button {
    font-size: 1.2rem;
    padding: 0.8rem 0.5rem;
    line-height: 1.4;
    text-align: left;
    width: 100%;
    font-weight: ${props => props.theme.typography.fontWeightRegular};
    color: inherit;
  }
  a > span {
    text-decoration: underline;
  }
`;

const Username = styled.p<{
  $secondaryColor?: string;
}>`
  font-weight: 400;
  margin: 0;
  width: 100%;
  color: ${({ $secondaryColor }) => $secondaryColor};
  opacity: 0.5;
  font-size: 1.2rem;
  padding: 0.5rem 0.5em 0.3rem;
`;

const MenuHeaderWrapper = styled.div`
  padding: 0;
`;

const MenuHeaderContainer = styled.div<{
  $secondaryColor?: string;
}>`
  display: flex;
  justify-content: flex-end;
  padding: 0.8em 0;
  align-items: center;
  border-bottom: 1px solid ${({ $secondaryColor }) => $secondaryColor};
  color: ${({ $secondaryColor }) => $secondaryColor};
`;

const MenuCloseIcon = styled(CloseIcon)<{
  $secondaryColor?: string;
}>`
  width: 1.2em;
  height: 1.2em;
  fill: ${({ $secondaryColor, theme }) => $secondaryColor || theme.palette.text.primary};
`;

const MenuCloseButton = styled(IconButton)`
  padding: 0;
`;

interface DrawerMenuProps {
  children: ReactNode;
  menuOpen: boolean;
  onCloseMenu: () => void;
  primaryColor?: string;
  secondaryColor?: string;
  isLoggedIn: boolean;
  currentUserUsername?: string;
}

export const DrawerMenu = ({
  children,
  menuOpen,
  onCloseMenu,
  primaryColor,
  secondaryColor,
  isLoggedIn,
  currentUserUsername,
}: DrawerMenuProps) => {
  return (
    <Drawer
      anchor="right"
      open={menuOpen}
      onClose={onCloseMenu}
      PaperProps={{ style: { backgroundColor: primaryColor, minWidth: '70vw' } }}
    >
      <MenuWrapper>
        <MenuHeaderWrapper>
          <MenuHeaderContainer $secondaryColor={secondaryColor}>
            {currentUserUsername && (
              <Username $secondaryColor={secondaryColor}>{currentUserUsername}</Username>
            )}
            <MenuCloseButton onClick={onCloseMenu} aria-label="Close menu">
              <MenuCloseIcon $secondaryColor={secondaryColor} />
            </MenuCloseButton>
          </MenuHeaderContainer>
        </MenuHeaderWrapper>
        <MenuList secondaryColor={secondaryColor}>
          {/** If the user is not logged in, show the register and login buttons */}
          {!isLoggedIn && (
            <>
              <MenuItem modal={MODAL_ROUTES.LOGIN} onCloseMenu={onCloseMenu}>
                Log in
              </MenuItem>
              <MenuItem modal={MODAL_ROUTES.REGISTER} onCloseMenu={onCloseMenu}>
                Register
              </MenuItem>
            </>
          )}
          {children}
        </MenuList>
      </MenuWrapper>
    </Drawer>
  );
};
