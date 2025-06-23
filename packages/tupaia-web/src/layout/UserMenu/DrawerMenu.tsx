import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Drawer as MuiDrawer } from '@material-ui/core';
import { IconButton } from '@tupaia/ui-components';
import CloseIcon from '@material-ui/icons/Close';
import { MenuItem, MenuList } from './MenuList';
import { MOBILE_BREAKPOINT, MODAL_ROUTES } from '../../constants';
import { User } from '../../types';
import { RouterButton } from '../../components';

/**
 * DrawerMenu is a drawer menu used when the user is on a mobile device
 */

const Drawer = styled(MuiDrawer)`
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const MenuWrapper = styled.div`
  padding: 0 1rem;
  li a,
  li button {
    font-size: 1.2rem;
    padding: 0.8rem 0.8rem;
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
  margin: 1rem 0 0 0;
  width: 100%;
  color: ${({ $secondaryColor }) => $secondaryColor};
  opacity: 0.5;
  font-size: 1.2rem;
`;

const MenuHeader = styled.div<{
  $secondaryColor?: string;
}>`
  display: flex;
  padding: 0 0.8rem;
  justify-content: space-between;
  align-items: flex-start;
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
  padding: 1rem;
  margin: 0 -1rem 0 0;
`;

const ProjectButton = styled(RouterButton).attrs({
  variant: 'text',
})`
  padding: 0.2rem 0.8rem 0.6rem;
  margin-inline-start: -0.8rem;
  text-decoration: none;

  .MuiButton-label {
    text-decoration: none;
    text-transform: none;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.palette.text.primary};
    transition: color 0.2s;
  }

  &:hover {
    background: none;
    .MuiButton-label {
      color: ${({ theme }) => theme.palette.text.primary};
      text-decoration: underline;
    }
  }
`;

interface DrawerMenuProps {
  children: ReactNode;
  menuOpen: boolean;
  onCloseMenu: () => void;
  primaryColor?: string;
  secondaryColor?: string;
  isLoggedIn: boolean;
  currentUser?: User;
}

export const DrawerMenu = ({
  children,
  menuOpen,
  onCloseMenu,
  primaryColor,
  secondaryColor,
  isLoggedIn,
  currentUser,
}: DrawerMenuProps) => {
  const currentUserUsername = currentUser?.userName;
  const userProjectName = currentUser?.project?.name || 'Explore';
  return (
    <Drawer
      anchor="right"
      open={menuOpen}
      onClose={onCloseMenu}
      PaperProps={{ style: { backgroundColor: primaryColor, minWidth: '70vw' } }}
    >
      <MenuWrapper>
        <MenuHeader $secondaryColor={secondaryColor}>
          <div>
            {currentUserUsername && (
              <Username $secondaryColor={secondaryColor}>{currentUserUsername}</Username>
            )}
            {userProjectName && (
              <ProjectButton
                modal={MODAL_ROUTES.PROJECT_SELECT}
                onClick={() => {
                  onCloseMenu();
                }}
              >
                {userProjectName}
              </ProjectButton>
            )}
          </div>
          <MenuCloseButton onClick={onCloseMenu} aria-label="Close menu">
            <MenuCloseIcon $secondaryColor={secondaryColor} />
          </MenuCloseButton>
        </MenuHeader>
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
