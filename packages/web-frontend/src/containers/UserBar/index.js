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
import styled from 'styled-components';
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
} from '../../actions';
import { LoginForm } from '../LoginForm';
import { EmailVerification, EmailVerifyNag } from '../EmailVerification';
import { RequestResetPasswordForm } from '../RequestResetPasswordForm';
import { SignupForm } from '../SignupForm';
import { ChangePasswordForm } from '../ChangePasswordForm';
import { RequestCountryAccessForm } from '../RequestCountryAccessForm';
import UserMenu from '../UserMenu';
import { LANDING } from '../OverlayDiv/constants';
import { USER_BAR_STYLES, DARK_BLUE, ERROR, FORM_BLUE, WHITE } from '../../styles';

const LightFormTheme = styled.div`
  p,
  a,
  label,
  .MuiFormLabel-root,
  .MuiCheckbox-root,
  .MuiButton-text,
  .MuiInput-underline::before {
    color: black;
    border-color: black;
  }

  p {
    padding: 18px;
  }

  .Mui-error {
    color: ${ERROR};
  }

  .Mui-focused {
    color: ${FORM_BLUE};
  }

  .MuiInputBase-input {
    color: ${DARK_BLUE};
  }
`;

export class UserBar extends Component {
  getDialogTitle() {
    const { dialogPage } = this.props;

    switch (dialogPage) {
      case DIALOG_PAGE_LOGIN:
        return 'Log in';

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
        return 480;
      default:
        return 730;
    }
  }

  renderDialog() {
    const { isDialogVisible, onCloseUserDialog } = this.props;
    const width = this.getWidth();
    return (
      <Dialog
        open={isDialogVisible}
        style={{ zIndex: 1301 }}
        PaperProps={{ style: { ...styles.dialogBody, width, maxWidth: width } }}
        onClose={() => onCloseUserDialog()}
        ref={dialog => {
          this.dialog = dialog;
        }}
      >
        <DialogTitle style={styles.dialogTitle}>{this.getDialogTitle()}</DialogTitle>
        <DialogContent>{this.renderDialogContent()}</DialogContent>
      </Dialog>
    );
  }

  renderDialogContent() {
    const { dialogPage, onOpenUserPage, onCloseUserDialog } = this.props;

    switch (dialogPage) {
      case DIALOG_PAGE_LOGIN:
        return (
          <LoginForm
            onClickSignup={() => onOpenUserPage(DIALOG_PAGE_SIGNUP)}
            onClickResetPassword={() => onOpenUserPage(DIALOG_PAGE_REQUEST_RESET_PASSWORD)}
          />
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
          <LightFormTheme>
            <ChangePasswordForm
              onClickChangePassword={() => onOpenUserPage(DIALOG_PAGE_CHANGE_PASSWORD)}
              useResetToken={dialogPage === DIALOG_PAGE_RESET_PASSWORD}
            />
          </LightFormTheme>
        );

      case DIALOG_PAGE_REQUEST_COUNTRY_ACCESS:
        return (
          <LightFormTheme>
            <RequestCountryAccessForm
              onClickRequestCountryAccess={() => onOpenUserPage(DIALOG_PAGE_REQUEST_COUNTRY_ACCESS)}
            />
          </LightFormTheme>
        );

      case DIALOG_PAGE_VERIFICATION_PAGE:
        return <EmailVerification onClose={() => onCloseUserDialog()} />;
      default:
        return '';
    }
  }

  render() {
    const form = this.renderDialog();

    return (
      <div style={USER_BAR_STYLES.container}>
        <div style={USER_BAR_STYLES.userMenu}>
          <UserMenu openLandingPage={this.props.onOpenLandingPage} />
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
  onCloseUserDialog: PropTypes.func.isRequired,
  isDialogVisible: PropTypes.bool.isRequired,
  dialogPage: PropTypes.oneOf([
    DIALOG_PAGE_LOGIN,
    DIALOG_PAGE_SIGNUP,
    DIALOG_PAGE_CHANGE_PASSWORD,
    DIALOG_PAGE_REQUEST_RESET_PASSWORD,
    DIALOG_PAGE_RESET_PASSWORD,
    DIALOG_PAGE_REQUEST_COUNTRY_ACCESS,
    DIALOG_PAGE_VERIFICATION_PAGE,
    '',
  ]).isRequired,
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
  },
};

const mapStateToProps = state => {
  const { isDialogVisible, dialogPage } = state.authentication;

  return {
    isDialogVisible,
    dialogPage,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onCloseUserDialog: () => dispatch(closeUserPage()),
    onOpenLandingPage: () => dispatch(setOverlayComponent(LANDING)),
    onOpenUserPage: userPage => dispatch(openUserPage(userPage)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserBar);
