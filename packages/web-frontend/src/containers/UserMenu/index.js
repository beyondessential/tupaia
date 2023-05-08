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
import { MenuItem } from './MenuList';

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

const createUserMenuItem = (text, onClick, href, onCloseMenu) => {
  const handleClickMenuItem = () => {
    if (onClick) onClick();
    onCloseMenu();
  };
  return (
    <MenuItem onClick={handleClickMenuItem} onCloseMenu={onCloseMenu} href={href}>
      {text}
    </MenuItem>
  );
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

  const isDrawer = isMobile();

  // When is mobile, use a drawer menu, otherwise use a popover menu
  const MenuComponent = isDrawer ? DrawerMenu : PopoverMenu;

  const toggleUserMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const onCloseMenu = () => {
    setMenuOpen(false);
  };

  // Create the menu items
  const VisitMainSite = (
    <MenuItem href="https://www.tupaia.org" onCloseMenu={onCloseMenu}>
      Visit&nbsp;<span>tupaia.org</span>
    </MenuItem>
  );

  const ViewProjects = (
    <MenuItem onClick={onOpenViewProjects} onCloseMenu={onCloseMenu}>
      View projects
    </MenuItem>
  );

  const HelpCentre = (
    <MenuItem
      href="https://beyond-essential.slab.com/posts/tupaia-instruction-manuals-05nke1dm"
      onCloseMenu={onCloseMenu}
    >
      Help centre
    </MenuItem>
  );
  const Logout = (
    <MenuItem
      onClick={isCustomLandingPage ? onAttemptLandingPageLogout : onAttemptUserLogout}
      onCloseMenu={onCloseMenu}
    >
      Logout
    </MenuItem>
  );
  const ChangePassword = (
    <MenuItem onClick={onToggleChangePasswordPanel} onCloseMenu={onCloseMenu}>
      Change password
    </MenuItem>
  );
  // The custom landing pages need different menu items to the other views
  const customLandingPageMenuItems = isUserLoggedIn
    ? [VisitMainSite, ChangePassword, Logout]
    : [VisitMainSite];

  const baseMenuItems = isUserLoggedIn
    ? [
        ViewProjects,
        ChangePassword,
        <MenuItem onClick={onToggleRequestCountryAccessPanel} onCloseMenu={onCloseMenu}>
          Request country access
        </MenuItem>,
        HelpCentre,
        Logout,
      ]
    : [ViewProjects, HelpCentre];

  // The different types of menus need different props, so handle this here and give the correct ones
  const menuProps = isDrawer
    ? {
        primaryColor,
        menuOpen,
        onCloseMenu,
        secondaryColor,
        onClickSignIn,
        onClickRegister,
        isUserLoggedIn,
        currentUserUsername,
      }
    : { primaryColor, menuOpen, onCloseMenu };

  return (
    <UserMenuContainer secondaryColor={secondaryColor}>
      {/** Only display the user info before the menu button if user is not on a mobile device, as the drawer menu handles this for mobile devices */}
      {!isDrawer && (
        <UserInfo
          showRegisterButton={!isUserLoggedIn && isCustomLandingPage}
          currentUserUsername={currentUserUsername}
          isCustomLandingPage={isCustomLandingPage}
          onClickRegister={onClickRegister}
          onClickSignIn={onClickSignIn}
          signInText={isCustomLandingPage ? 'Log in' : 'Sign In / Register'}
          secondaryColor={secondaryColor}
        />
      )}
      <StyledMenuButton onClick={toggleUserMenu} disableRipple id="user-menu-button">
        <StyledMenuIcon />
      </StyledMenuButton>
      <MenuComponent {...menuProps}>
        {isCustomLandingPage ? customLandingPageMenuItems : baseMenuItems}
      </MenuComponent>
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
