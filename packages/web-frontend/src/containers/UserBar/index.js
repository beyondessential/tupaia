/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * UserBar
 *
 * The controls for signing in, info, account etc.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import {
  closeUserPage,
  openUserPage,
  setOverlayComponent,
  DIALOG_PAGE_LOGIN,
  DIALOG_PAGE_REQUEST_RESET_PASSWORD,
  DIALOG_PAGE_SIGNUP,
  DIALOG_PAGE_CHANGE_PASSWORD,
  DIALOG_PAGE_RESET_PASSWORD,
  DIALOG_PAGE_REQUEST_COUNTRY_ACCESS,
  DIALOG_PAGE_VERIFICATION_PAGE,
  DIALOG_PAGE_ONE_TIME_LOGIN,
  closeDropdownOverlays,
  attemptUserLogout,
} from '../../actions';
import { LoginForm } from '../LoginForm';
import { EmailVerification, EmailVerifyNag } from '../EmailVerification';
import { RequestResetPasswordForm } from '../RequestResetPasswordForm';
import { SignupForm } from '../SignupForm';
import { ChangePasswordForm } from '../ChangePasswordForm';
import { RequestCountryAccessForm } from '../RequestCountryAccessForm';
import UserMenu from '../UserMenu';
import { LANDING, VIEW_PROJECTS } from '../OverlayDiv/constants';
import { USER_BAR_STYLES, DARK_BLUE, WHITE } from '../../styles';
import { OneTimeLoginForm } from '../ResetPasswordOneTimeLoginForm';
import { LightThemeProvider } from '../../styles/LightThemeProvider';

export class UserBar extends Component {
  getDialogTitle() {
    const { dialogPage } = this.props;

    switch (dialogPage) {
      case DIALOG_PAGE_LOGIN:
        return 'Log in';

      case DIALOG_PAGE_ONE_TIME_LOGIN:
        return 'Reset Password';

      case DIALOG_PAGE_REQUEST_RESET_PASSWORD:
        return 'Reset password';

      case DIALOG_PAGE_SIGNUP:
        return 'Sign up to Tupaia';

      case DIALOG_PAGE_CHANGE_PASSWORD:
        return 'Change password';

      case DIALOG_PAGE_RESET_PASSWORD:
        return 'Enter your new password';

      case DIALOG_PAGE_REQUEST_COUNTRY_ACCESS:
        return 'Request access to countries';

      case DIALOG_PAGE_VERIFICATION_PAGE:
        return 'Please enter email address to re send';

      default:
        return '';
    }
  }

  getWidth() {
    const { dialogPage } = this.props;

    switch (dialogPage) {
      case DIALOG_PAGE_CHANGE_PASSWORD:
      case DIALOG_PAGE_REQUEST_RESET_PASSWORD:
      case DIALOG_PAGE_RESET_PASSWORD:
      case DIALOG_PAGE_REQUEST_COUNTRY_ACCESS:
      case DIALOG_PAGE_ONE_TIME_LOGIN:
        return 480;
      default:
        return 730;
    }
  }

  getMenuItems = () => {
    const {
      isUserLoggedIn,
      onOpenViewProjects,
      onToggleChangePasswordPanel,
      onToggleRequestCountryAccessPanel,
      onAttemptUserLogout,
    } = this.props;

    const viewProjects = {
      text: 'View projects',
      action: onOpenViewProjects,
    };
    const helpCentre = {
      text: 'Help centre',
      type: 'link',
      url: 'https://beyond-essential.slab.com/posts/tupaia-instruction-manuals-05nke1dm',
    };
    if (!isUserLoggedIn) {
      return [viewProjects, helpCentre];
    }
    return [
      viewProjects,
      {
        text: 'Change password',
        action: onToggleChangePasswordPanel,
      },
      {
        text: 'Request country access',
        action: onToggleRequestCountryAccessPanel,
      },
      helpCentre,
      {
        text: 'Logout',
        action: onAttemptUserLogout,
      },
    ];
  };

  renderDialogContent() {
    const { dialogPage, onOpenUserPage, onCloseUserDialog, onOpenLandingPage } = this.props;

    switch (dialogPage) {
      case DIALOG_PAGE_LOGIN:
        return (
          <LoginForm
            onClickSignup={() => onOpenUserPage(DIALOG_PAGE_SIGNUP)}
            onClickResetPassword={() => onOpenUserPage(DIALOG_PAGE_REQUEST_RESET_PASSWORD)}
          />
        );

      case DIALOG_PAGE_ONE_TIME_LOGIN:
        return (
          <LightThemeProvider>
            <OneTimeLoginForm
              onNavigateToRequestPasswordReset={() => {
                // This prop can be changed to a simple link/removed after url based routing implemented in #770
                onCloseUserDialog();
                onOpenLandingPage();
              }}
            />
          </LightThemeProvider>
        );

      case DIALOG_PAGE_REQUEST_RESET_PASSWORD:
        return <RequestResetPasswordForm onClickCancel={() => onOpenUserPage(DIALOG_PAGE_LOGIN)} />;

      case DIALOG_PAGE_SIGNUP:
        return (
          <SignupForm
            onClickLogin={() => onOpenUserPage(DIALOG_PAGE_LOGIN)}
            onClickResend={() => onOpenUserPage(DIALOG_PAGE_VERIFICATION_PAGE)}
          />
        );

      case DIALOG_PAGE_CHANGE_PASSWORD:
      case DIALOG_PAGE_RESET_PASSWORD:
        return (
          <LightThemeProvider>
            <ChangePasswordForm
              onClickChangePassword={() => onOpenUserPage(DIALOG_PAGE_CHANGE_PASSWORD)}
              useResetToken={dialogPage === DIALOG_PAGE_RESET_PASSWORD}
            />
          </LightThemeProvider>
        );

      case DIALOG_PAGE_REQUEST_COUNTRY_ACCESS:
        return (
          <LightThemeProvider>
            <RequestCountryAccessForm
              onClickRequestCountryAccess={() => onOpenUserPage(DIALOG_PAGE_REQUEST_COUNTRY_ACCESS)}
            />
          </LightThemeProvider>
        );

      case DIALOG_PAGE_VERIFICATION_PAGE:
        return <EmailVerification onClose={() => onCloseUserDialog()} />;
      default:
        return '';
    }
  }

  renderDialog() {
    const { isDialogVisible, onCloseUserDialog, dialogPage } = this.props;
    const width = this.getWidth();
    // Don't let the user close a dialog if it is a password reset form as the one time login token
    // is used to load the form and so they need to do the password reset now */
    return (
      <Dialog
        open={isDialogVisible}
        style={{ zIndex: 1301 }}
        PaperProps={{ style: { ...styles.dialogBody, width, maxWidth: width } }}
        onClose={dialogPage === DIALOG_PAGE_RESET_PASSWORD ? null : onCloseUserDialog}
        ref={dialog => {
          this.dialog = dialog;
        }}
      >
        <DialogTitle style={styles.dialogTitle}>{this.getDialogTitle()}</DialogTitle>
        <DialogContent>{this.renderDialogContent()}</DialogContent>
      </Dialog>
    );
  }

  render() {
    const form = this.renderDialog();
    const { onOpenLandingPage } = this.props;

    return (
      <div style={USER_BAR_STYLES.container}>
        <div style={USER_BAR_STYLES.userMenu}>
          <UserMenu
            onClickSignIn={onOpenLandingPage}
            signInText="Sign In / Register"
            menuItems={this.getMenuItems()}
          />
          <EmailVerifyNag />
        </div>
        {form}
      </div>
    );
  }
}

UserBar.propTypes = {
  onOpenUserPage: PropTypes.func.isRequired,
  onOpenLandingPage: PropTypes.func.isRequired,
  onOpenViewProjects: PropTypes.func.isRequired,
  onCloseUserDialog: PropTypes.func.isRequired,
  isDialogVisible: PropTypes.bool.isRequired,
  dialogPage: PropTypes.oneOf([
    DIALOG_PAGE_LOGIN,
    DIALOG_PAGE_ONE_TIME_LOGIN,
    DIALOG_PAGE_SIGNUP,
    DIALOG_PAGE_CHANGE_PASSWORD,
    DIALOG_PAGE_REQUEST_RESET_PASSWORD,
    DIALOG_PAGE_RESET_PASSWORD,
    DIALOG_PAGE_REQUEST_COUNTRY_ACCESS,
    DIALOG_PAGE_VERIFICATION_PAGE,
    '',
  ]).isRequired,
  isUserLoggedIn: PropTypes.bool.isRequired,
  onToggleChangePasswordPanel: PropTypes.func.isRequired,
  onToggleRequestCountryAccessPanel: PropTypes.func.isRequired,
  onAttemptUserLogout: PropTypes.func.isRequired,
};

const styles = {
  dialogTitle: {
    backgroundColor: DARK_BLUE,
    color: WHITE,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 500,
    padding: '21px 24px',
  },
  dialogBody: {
    color: DARK_BLUE,
    backgroundColor: WHITE,
    overflowY: 'auto',
    borderRadius: 0,
  },
};

const mapStateToProps = state => {
  const { isDialogVisible, dialogPage, isUserLoggedIn } = state.authentication;

  return {
    isDialogVisible,
    dialogPage,
    isUserLoggedIn,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onCloseUserDialog: () => dispatch(closeUserPage()),
    onOpenLandingPage: () => dispatch(setOverlayComponent(LANDING)),
    onOpenViewProjects: () => dispatch(setOverlayComponent(VIEW_PROJECTS)),
    onOpenUserPage: userPage => dispatch(openUserPage(userPage)),
    onToggleChangePasswordPanel: () =>
      dispatch(closeDropdownOverlays()) && dispatch(openUserPage(DIALOG_PAGE_CHANGE_PASSWORD)),
    onToggleRequestCountryAccessPanel: () =>
      dispatch(closeDropdownOverlays()) &&
      dispatch(openUserPage(DIALOG_PAGE_REQUEST_COUNTRY_ACCESS)),
    onAttemptUserLogout: () => dispatch(attemptUserLogout()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserBar);
