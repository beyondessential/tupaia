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
import { openHelpCenter } from '../../utils';

const LOG_IN_ITEM = 'LOG_IN_ITEM';
const PROJECTS_ITEM = 'PROJECTS_ITEM';
const CHANGE_PASSWORD_ITEM = 'CHANGE_PASSWORD_ITEM';
const REQUEST_COUNTRY_ACCESS_ITEM = 'REQUEST_COUNTRY_ACCESS_ITEM';
const LOG_OUT_ITEM = 'LOG_OUT_ITEM';

const UserMenuContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledMenuButton = styled(Button)`
  width: 32px;
  min-width: 32px;
`;

const UsernameContainer = styled.div`
  padding-right: 5px;
  color: ${props => props.theme.palette.text.primary};
`;

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
          <MenuIcon />
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
        Help Centre
      </MenuItem>
    );

    if (!isUserLoggedIn) {
      return (
        <UserMenuContainer>
          <Button onClick={() => openLandingPage()}>Sign in / Register</Button>
          <Menu>
            <ViewProjects />
            <HelpCenter />
          </Menu>
        </UserMenuContainer>
      );
    }

    return (
      <div>
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
      </div>
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
