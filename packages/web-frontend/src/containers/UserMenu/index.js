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
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import styled from 'styled-components';
import MenuIcon from '@material-ui/icons/Menu';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import {
  attemptUserLogout,
  closeDropdownOverlays,
  openUserPage,
  DIALOG_PAGE_LOGIN,
  DIALOG_PAGE_CHANGE_PASSWORD,
  DIALOG_PAGE_REQUEST_COUNTRY_ACCESS,
} from '../../actions';
import { DARK_BLUE } from '../../styles';

const LOG_IN_ITEM = 'LOG_IN_ITEM';
const PROJECTS_ITEM = 'PROJECTS_ITEM';
const CHANGE_PASSWORD_ITEM = 'CHANGE_PASSWORD_ITEM';
const REQUEST_COUNTRY_ACCESS_ITEM = 'REQUEST_COUNTRY_ACCESS_ITEM';
const LOG_OUT_ITEM = 'LOG_OUT_ITEM';

const UserMenuContainer = styled.div`
  display: flex;
  align-items: center;
`;

const SignInButton = styled(Button)`
  text-transform: none;

  border-color: ${props => props.theme.palette.text.primary};
  border: 1px;
  border-style: solid;
  border-radius: 18px;

  font-weight: 400;
  height: 30px;
  margin-right: 5px;
`;

const StyledMenuButton = styled(Button)`
  width: 32px;
  min-width: 32px;
  height: 32px;
`;

const StyledMenuIcon = styled(MenuIcon)`
  width: 28px;
  height: 28px;
`;

const UsernameContainer = styled.div`
  padding-right: 5px;
  color: ${props => props.theme.palette.text.primary};
  font-weight: 400;
  font-size: 0.875rem;
`;

const SignInContainer = styled.span`
  padding-right: 4px;
  padding-left: 4px;
`;

const openHelpCenter = () =>
  window
    .open('https://beyond-essential.slab.com/posts/tupaia-instruction-manuals-05nke1dm', '_blank')
    .focus();

class UserMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      menuOpen: false,
    };
  }

  toggleUserMenu(isMenuOpen) {
    this.setState({
      menuOpen: !isMenuOpen,
    });
  }

  closeUserMenu() {
    this.setState({
      menuOpen: false,
    });
  }

  selectMenuItem(item) {
    switch (item) {
      case LOG_IN_ITEM:
        this.props.onToggleLoginPanel();
        break;

      case PROJECTS_ITEM:
        this.props.onToggleProjectsPanel();
        break;

      case CHANGE_PASSWORD_ITEM:
        this.props.onToggleChangePasswordPanel();
        break;

      case REQUEST_COUNTRY_ACCESS_ITEM:
        this.props.onToggleRequestCountryAccessPanel();
        break;

      case LOG_OUT_ITEM:
      default:
        this.props.onAttemptUserLogout();
        break;
    }
    this.closeUserMenu();
  }

  render() {
    const { isUserLoggedIn, currentUserUsername, openLandingPage, openViewProjects } = this.props;

    const Menu = ({ children: menuItems }) => (
      <div>
        <StyledMenuButton
          onClick={() => this.toggleUserMenu(this.state.menuOpen)}
          style={styles.username}
          disableRipple
          id="user-menu-button"
        >
          <StyledMenuIcon />
        </StyledMenuButton>
        <Popover
          PaperProps={{ style: { backgroundColor: DARK_BLUE } }}
          open={this.state.menuOpen}
          anchorEl={() => document.getElementById('user-menu-button')}
          onClose={() => this.closeUserMenu()}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {menuItems}
        </Popover>
      </div>
    );

    const ViewProjects = () => (
      <MenuItem
        onClick={() => {
          openViewProjects();
          this.closeUserMenu();
        }}
      >
        View projects
      </MenuItem>
    );

    const HelpCenter = () => (
      <MenuItem
        onClick={() => {
          openHelpCenter();
          this.closeUserMenu();
        }}
      >
        Help centre
      </MenuItem>
    );

    if (!isUserLoggedIn) {
      return (
        <UserMenuContainer>
          <SignInButton onClick={() => openLandingPage()}>
            <SignInContainer>Sign in / Register</SignInContainer>
          </SignInButton>
          <Menu>
            <ViewProjects />
            <HelpCenter />
          </Menu>
        </UserMenuContainer>
      );
    }

    return (
      <UserMenuContainer>
        <UsernameContainer>{currentUserUsername}</UsernameContainer>
        <Menu>
          <ViewProjects />
          <MenuItem onClick={() => this.selectMenuItem(CHANGE_PASSWORD_ITEM)}>
            Change password
          </MenuItem>
          <MenuItem onClick={() => this.selectMenuItem(REQUEST_COUNTRY_ACCESS_ITEM)}>
            Request country access
          </MenuItem>
          <HelpCenter />
          <MenuItem onClick={() => this.selectMenuItem(LOG_OUT_ITEM)}>Log out</MenuItem>
        </Menu>
      </UserMenuContainer>
    );
  }
}

const styles = {
  menu: {
    textAlign: 'right',
  },
  username: {
    textAlign: 'right',
  },
};

UserMenu.propTypes = {
  isUserLoggedIn: PropTypes.bool.isRequired,
  onAttemptUserLogout: PropTypes.func.isRequired,
  openLandingPage: PropTypes.func.isRequired,
  openViewProjects: PropTypes.func.isRequired,
  currentUserUsername: PropTypes.string.isRequired,
  onToggleLoginPanel: PropTypes.func.isRequired,
  onToggleProjectsPanel: PropTypes.func.isRequired,
  onToggleChangePasswordPanel: PropTypes.func.isRequired,
  onToggleRequestCountryAccessPanel: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const {
    isUserLoggedIn,
    currentUserUsername,
    isRequestingLogin,
    loginFailedMessage,
  } = state.authentication;

  return {
    isUserLoggedIn,
    currentUserUsername,
    isRequestingLogin,
    loginFailedMessage,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onToggleLoginPanel: () =>
      dispatch(closeDropdownOverlays()) && dispatch(openUserPage(DIALOG_PAGE_LOGIN)),
    onToggleProjectsPanel: () =>
      dispatch(closeDropdownOverlays()) && dispatch(openUserPage(DIALOG_PAGE_LOGIN)),
    onToggleChangePasswordPanel: () =>
      dispatch(closeDropdownOverlays()) && dispatch(openUserPage(DIALOG_PAGE_CHANGE_PASSWORD)),
    onToggleRequestCountryAccessPanel: () =>
      dispatch(closeDropdownOverlays()) &&
      dispatch(openUserPage(DIALOG_PAGE_REQUEST_COUNTRY_ACCESS)),
    onAttemptUserLogout: () => dispatch(attemptUserLogout()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserMenu);
