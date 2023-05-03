/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * UserMenu
 *
 * The controls for user Menu: show signIn option and loginForm.
 * If user is logged in, shows username and SingOut option.
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import MenuIcon from '@material-ui/icons/Menu';
import { ListItem, Button, Popover, Link } from '@material-ui/core';
import { DARK_BLUE, WHITE } from '../../styles';
import { useCustomLandingPages } from '../../screens/LandingPage/useCustomLandingPages';
import {
  DIALOG_PAGE_CHANGE_PASSWORD,
  DIALOG_PAGE_REQUEST_COUNTRY_ACCESS,
  attemptUserLogout,
  closeDropdownOverlays,
  openUserPage,
  setAuthViewState,
  setOverlayComponent,
} from '../../actions';
import { LANDING, AUTH_VIEW_STATES, VIEW_PROJECTS } from '../OverlayDiv/constants';

const UserMenuContainer = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.secondaryColor};
`;

const SignInButton = styled(Button)`
  text-transform: none;
  border: 1px solid ${props => props.secondaryColor};
  border-radius: 18px;
  font-weight: ${props => props.theme.typography.fontWeightMedium};
  height: 30px;
  margin-right: 0.5em;
  padding-left: 1em;
  padding-right: 1em;
`;

const StyledMenuButton = styled(Button)`
  width: 32px;
  min-width: 32px;
  height: 32px;
  text-align: right;
`;

const StyledMenuIcon = styled(MenuIcon)`
  width: 28px;
  height: 28px;
`;

const UsernameContainer = styled.div`
  padding-right: 5px;
  font-weight: 400;
  font-size: 0.875rem;
`;

const MenuItemButton = styled(Button)`
  text-transform: none;
  font-size: 1rem;
  font-weight: ${props => props.theme.typography.fontWeightRegular};
  padding: 0.4em 1em;
  line-height: 1.4;
  width: 100%;
  justify-content: flex-start;
`;
const MenuItemLink = styled(Link)`
  font-size: 1rem;
  padding: 0.4em 1em;
  line-height: 1.4;
  width: 100%;
  color: inherit;
  text-decoration: none;
  &:hover,
  &:focus {
    text-decoration: none;
    background-color: rgba(255, 255, 255, 0.08);
  }
`;

const MenuList = styled.ul`
  list-style: none;
  margin-block-start: 0;
  margin-block-end: 0;
  padding-inline-start: 0;
`;

const MenuListItem = styled(ListItem)`
  padding: 0;
`;

const RegisterButton = styled(Button)`
  text-transform: none;
  margin-right: 0.5em;
`;

const MenuItem = ({ type, children, ...props }) =>
  type === 'link' ? (
    <MenuItemLink {...props} target="_blank">
      {children}
    </MenuItemLink>
  ) : (
    <MenuItemButton {...props}>{children}</MenuItemButton>
  );

MenuItem.propTypes = {
  type: PropTypes.oneOf(['link', 'button']),
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
};

MenuItem.defaultProps = {
  type: 'button',
};

const UserMenu = ({
  isUserLoggedIn,
  currentUserUsername,
  onClickSignIn,
  onOpenViewProjects,
  onToggleChangePasswordPanel,
  onToggleRequestCountryAccessPanel,
  onAttemptUserLogout,
  onClickRegister,
}) => {
  const { isCustomLandingPage, customLandingPageSettings = {} } = useCustomLandingPages();
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    secondary_hexcode: customLandingPageSecondaryColor,
    primary_hexcode: customLandingPagePrimaryColor,
  } = customLandingPageSettings;

  const primaryColor = customLandingPagePrimaryColor || DARK_BLUE;
  const secondaryColor = customLandingPageSecondaryColor || WHITE;

  const signInText = isCustomLandingPage ? 'Log in' : 'Sign In / Register';

  let menuItems = [];

  const logout = {
    text: 'Logout',
    action: onAttemptUserLogout,
  };
  const changePassword = {
    text: 'Change Password',
    action: onToggleChangePasswordPanel,
  };
  // if is a custom landing page, display only the appropriate items
  if (isCustomLandingPage) {
    const visitMainSite = {
      text: 'Visit tupaia.org',
      type: 'link',
      url: window.location.origin,
    };
    menuItems = isUserLoggedIn ? [visitMainSite, changePassword, logout] : [visitMainSite];
  } else {
    // otherwise display as usual
    const viewProjects = {
      text: 'View projects',
      action: onOpenViewProjects,
    };
    const helpCentre = {
      text: 'Help centre',
      type: 'link',
      url: 'https://beyond-essential.slab.com/posts/tupaia-instruction-manuals-05nke1dm',
    };
    menuItems = isUserLoggedIn
      ? [
          viewProjects,
          changePassword,
          {
            text: 'Request country access',
            action: onToggleRequestCountryAccessPanel,
          },
          helpCentre,
          {
            text: 'Logout',
            action: onAttemptUserLogout,
          },
        ]
      : [viewProjects, helpCentre];
  }

  const toggleUserMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeUserMenu = () => {
    setMenuOpen(false);
  };

  const showRegisterButton = !isUserLoggedIn && isCustomLandingPage;

  return (
    <UserMenuContainer secondaryColor={secondaryColor}>
      {isUserLoggedIn ? (
        <UsernameContainer>{currentUserUsername}</UsernameContainer>
      ) : (
        <>
          {showRegisterButton && (
            <RegisterButton onClick={onClickRegister}>Register</RegisterButton>
          )}
          <SignInButton onClick={onClickSignIn} secondaryColor={secondaryColor}>
            {signInText}
          </SignInButton>
        </>
      )}
      <div>
        <StyledMenuButton onClick={toggleUserMenu} disableRipple id="user-menu-button">
          <StyledMenuIcon />
        </StyledMenuButton>
        <Popover
          PaperProps={{ style: { backgroundColor: primaryColor } }}
          open={menuOpen}
          anchorEl={() => document.getElementById('user-menu-button')}
          onClose={closeUserMenu}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuList>
            {menuItems.map(({ action, text, type, url }) => (
              <MenuListItem key={text}>
                <MenuItem
                  type={type}
                  onClick={() => {
                    if (action) action();
                    closeUserMenu();
                  }}
                  href={url}
                >
                  {text}
                </MenuItem>
              </MenuListItem>
            ))}
          </MenuList>
        </Popover>
      </div>
    </UserMenuContainer>
  );
};

UserMenu.propTypes = {
  isUserLoggedIn: PropTypes.bool.isRequired,
  onClickSignIn: PropTypes.func.isRequired,
  currentUserUsername: PropTypes.string.isRequired,
  onOpenViewProjects: PropTypes.func.isRequired,
  onToggleChangePasswordPanel: PropTypes.func.isRequired,
  onToggleRequestCountryAccessPanel: PropTypes.func.isRequired,
  onAttemptUserLogout: PropTypes.func.isRequired,
  onClickRegister: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const { isUserLoggedIn, currentUserUsername } = state.authentication;
  return {
    isUserLoggedIn,
    currentUserUsername,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onOpenViewProjects: () => dispatch(setOverlayComponent(VIEW_PROJECTS)),
    onToggleChangePasswordPanel: () =>
      dispatch(closeDropdownOverlays()) && dispatch(openUserPage(DIALOG_PAGE_CHANGE_PASSWORD)),
    onToggleRequestCountryAccessPanel: () =>
      dispatch(closeDropdownOverlays()) &&
      dispatch(openUserPage(DIALOG_PAGE_REQUEST_COUNTRY_ACCESS)),
    onClickSignIn: () => {
      dispatch(setOverlayComponent(LANDING));
      dispatch(setAuthViewState(AUTH_VIEW_STATES.LOGIN));
    },
    onAttemptUserLogout: () => dispatch(attemptUserLogout()),
    onClickRegister: () => {
      dispatch(setOverlayComponent(LANDING));
      dispatch(setAuthViewState(AUTH_VIEW_STATES.REGISTER));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserMenu);
