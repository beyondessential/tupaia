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
 * If user is logged in, shows username and SignOut option.
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import MenuIcon from '@material-ui/icons/Menu';
import { Button } from '@material-ui/core';
import { DARK_BLUE, WHITE } from '../../styles';
import { useCustomLandingPages } from '../../screens/LandingPage/useCustomLandingPages';
import {
  DIALOG_PAGE_CHANGE_PASSWORD,
  DIALOG_PAGE_REQUEST_COUNTRY_ACCESS,
  attemptLandingPageLogout,
  attemptUserLogout,
  closeDropdownOverlays,
  openUserPage,
  setAuthViewState,
  setOverlayComponent,
} from '../../actions';
import { LANDING, AUTH_VIEW_STATES, VIEW_PROJECTS } from '../OverlayDiv/constants';
import { isMobile } from '../../utils';
import { PopoverMenu } from './PopoverMenu';
import { DrawerMenu } from './DrawerMenu';
import { UserInfo } from './UserInfo';

const UserMenuContainer = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.secondaryColor};
`;

const StyledMenuButton = styled(Button)`
  width: 2em;
  min-width: 2em;
  height: 2em;
  text-align: right;
  padding: 0;
`;

const StyledMenuIcon = styled(MenuIcon)`
  width: 100%;
  height: 100%;
`;

const UserMenu = ({
  isUserLoggedIn,
  currentUserUsername,
  onClickSignIn,
  onOpenViewProjects,
  onToggleChangePasswordPanel,
  onToggleRequestCountryAccessPanel,
  onAttemptUserLogout,
  onClickRegister,
  onAttemptLandingPageLogout,
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

  const logout = {
    actionText: 'Logout',
    action: onAttemptUserLogout,
  };
  const changePassword = {
    actionText: 'Change Password',
    action: onToggleChangePasswordPanel,
  };
  const isDrawer = isMobile();

  const visitMainSite = {
    preText: isDrawer ? 'Visit ' : '',
    actionText: isDrawer ? 'tupaia.org' : 'Visit tupaia.org',
    type: 'link',
    url: window.location.origin,
  };
  const viewProjects = {
    actionText: 'View projects',
    action: onOpenViewProjects,
  };
  const helpCentre = {
    actionText: 'Help centre',
    type: 'link',
    url: 'https://beyond-essential.slab.com/posts/tupaia-instruction-manuals-05nke1dm',
  };

  const customLandingPageMenuItems = isUserLoggedIn
    ? [
        visitMainSite,
        changePassword,
        {
          ...logout,
          action: onAttemptLandingPageLogout,
        },
      ]
    : [visitMainSite];

  const baseMenuItems = isUserLoggedIn
    ? [
        viewProjects,
        changePassword,
        {
          actionText: 'Request country access',
          action: onToggleRequestCountryAccessPanel,
        },
        helpCentre,
        {
          actionText: 'Logout',
          action: onAttemptUserLogout,
        },
      ]
    : [viewProjects, helpCentre];

  const toggleUserMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeUserMenu = () => {
    setMenuOpen(false);
  };

  const showRegisterButton = !isUserLoggedIn && isCustomLandingPage;

  const MenuComponent = isDrawer ? DrawerMenu : PopoverMenu;
  const menuItems = isCustomLandingPage ? customLandingPageMenuItems : baseMenuItems;

  return (
    <UserMenuContainer secondaryColor={secondaryColor}>
      {/** Only display the user info before the menu button if user is not on a mobile device, as the drawer menu handles this for mobile devices */}
      {!isDrawer && (
        <UserInfo
          showRegisterButton={showRegisterButton}
          currentUserUsername={currentUserUsername}
          isCustomLandingPage={isCustomLandingPage}
          onClickRegister={onClickRegister}
          onClickSignIn={onClickSignIn}
          signInText={signInText}
          secondaryColor={secondaryColor}
        />
      )}
      <StyledMenuButton onClick={toggleUserMenu} disableRipple id="user-menu-button">
        <StyledMenuIcon />
      </StyledMenuButton>
      <MenuComponent
        menuOpen={menuOpen}
        primaryColor={primaryColor}
        onCloseMenu={closeUserMenu}
        secondaryColor={secondaryColor}
        onClickSignIn={onClickSignIn}
        onClickRegister={onClickRegister}
        signInText={signInText}
        menuItems={menuItems}
        isUserLoggedIn={isUserLoggedIn}
        currentUserUsername={currentUserUsername}
      />
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
  onAttemptLandingPageLogout: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const { isUserLoggedIn, currentUserUsername } = state.authentication;
  return {
    isUserLoggedIn,
    currentUserUsername: isUserLoggedIn ? currentUserUsername : null,
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
    onAttemptLandingPageLogout: () => dispatch(attemptLandingPageLogout()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserMenu);
