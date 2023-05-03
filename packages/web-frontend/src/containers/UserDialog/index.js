import { Dialog } from 'material-ui';
import React, { useRef } from 'react';
import { connect } from 'react-redux';
import { DialogContent, DialogTitle } from '@material-ui/core';
import { DARK_BLUE, WHITE } from '../../styles';
import {
  DIALOG_PAGE_CHANGE_PASSWORD,
  DIALOG_PAGE_LOGIN,
  DIALOG_PAGE_ONE_TIME_LOGIN,
  DIALOG_PAGE_REQUEST_COUNTRY_ACCESS,
  DIALOG_PAGE_REQUEST_RESET_PASSWORD,
  DIALOG_PAGE_RESET_PASSWORD,
  DIALOG_PAGE_SIGNUP,
  DIALOG_PAGE_VERIFICATION_PAGE,
  closeUserPage,
  openUserPage,
  setOverlayComponent,
} from '../../actions';
import { LANDING } from '../OverlayDiv/constants';
import { LoginForm } from '../LoginForm';
import { LightThemeProvider } from '../../styles/LightThemeProvider';
import { OneTimeLoginForm } from '../ResetPasswordOneTimeLoginForm';
import { RequestResetPasswordForm } from '../RequestResetPasswordForm';
import { SignupForm } from '../SignupForm';
import { ChangePasswordForm } from '../ChangePasswordForm';
import { RequestCountryAccessForm } from '../RequestCountryAccessForm';
import { EmailVerification } from '../EmailVerification';

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

const UserDialogContent = ({
  type,
  onClickSignup,
  onClickResetPassword,
  onNavigateToRequestPasswordReset,
  onCancelResetPassword,
  onClickLogin,
  onClickResendEmail,
  onClickChangePassword,
  onClickRequestCountryAccess,
  onCloseDialog,
}) => {
  switch (type) {
    case DIALOG_PAGE_LOGIN:
      return (
        <LoginForm onClickSignup={onClickSignup} onClickResetPassword={onClickResetPassword} />
      );

    case DIALOG_PAGE_ONE_TIME_LOGIN:
      return (
        <LightThemeProvider>
          <OneTimeLoginForm onNavigateToRequestPasswordReset={onNavigateToRequestPasswordReset} />
        </LightThemeProvider>
      );

    case DIALOG_PAGE_REQUEST_RESET_PASSWORD:
      return <RequestResetPasswordForm onClickCancel={onCancelResetPassword} />;

    case DIALOG_PAGE_SIGNUP:
      return <SignupForm onClickLogin={onClickLogin} onClickResend={onClickResendEmail} />;

    case DIALOG_PAGE_CHANGE_PASSWORD:
    case DIALOG_PAGE_RESET_PASSWORD:
      return (
        <LightThemeProvider>
          <ChangePasswordForm
            onClickChangePassword={onClickChangePassword}
            useResetToken={type === DIALOG_PAGE_RESET_PASSWORD}
          />
        </LightThemeProvider>
      );

    case DIALOG_PAGE_REQUEST_COUNTRY_ACCESS:
      return (
        <LightThemeProvider>
          <RequestCountryAccessForm onClickRequestCountryAccess={onClickRequestCountryAccess} />
        </LightThemeProvider>
      );

    case DIALOG_PAGE_VERIFICATION_PAGE:
      return <EmailVerification onClose={onCloseDialog} />;

    default:
      return null;
  }
};

const UserDialog = ({
  isOpen,
  width,
  title,
  onCloseDialog,
  type,
  onClickSignup,
  onClickResetPassword,
  onNavigateToRequestPasswordReset,
  onCancelResetPassword,
  onClickLogin,
  onClickResendEmail,
  onClickChangePassword,
  onClickRequestCountryAccess,
}) => {
  if (!isOpen) return null;
  return (
    <Dialog
      open={isOpen}
      style={{ zIndex: 1301 }}
      PaperProps={{ style: { ...styles.dialogBody, width, maxWidth: width } }}
      onClose={onCloseDialog}
    >
      <DialogTitle style={styles.dialogTitle}>{title}</DialogTitle>
      <DialogContent>
        <UserDialogContent
          type={type}
          onClickSignup={onClickSignup}
          onClickResetPassword={onClickResetPassword}
          onNavigateToRequestPasswordReset={onNavigateToRequestPasswordReset}
          onCancelResetPassword={onCancelResetPassword}
          onClickLogin={onClickLogin}
          onClickResendEmail={onClickResendEmail}
          onClickChangePassword={onClickChangePassword}
          onClickRequestCountryAccess={onClickRequestCountryAccess}
        />
      </DialogContent>
    </Dialog>
  );
};

const getTitle = dialogPage => {
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
};

const mapStateToProps = state => {
  const { isDialogVisible, dialogPage } = state.authentication;
  const smallWidthTypes = [
    DIALOG_PAGE_CHANGE_PASSWORD,
    DIALOG_PAGE_REQUEST_RESET_PASSWORD,
    DIALOG_PAGE_RESET_PASSWORD,
    DIALOG_PAGE_REQUEST_COUNTRY_ACCESS,
    DIALOG_PAGE_ONE_TIME_LOGIN,
  ];

  return {
    isOpen: isDialogVisible,
    width: smallWidthTypes.includes(dialogPage) ? 480 : 730,
    title: getTitle(dialogPage),
    type: dialogPage,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onCloseDialog: () => dispatch(closeUserPage()),
    onClickSignup: () => dispatch(openUserPage(DIALOG_PAGE_SIGNUP)),
    onClickResetPassword: () => dispatch(openUserPage(DIALOG_PAGE_REQUEST_RESET_PASSWORD)),
    onNavigateToRequestPasswordReset: () => {
      // This prop can be changed to a simple link/removed after url based routing implemented in #770
      dispatch(closeUserPage());
      dispatch(setOverlayComponent(LANDING));
    },
    onCancelResetPassword: () => dispatch(openUserPage(DIALOG_PAGE_LOGIN)),
    onClickLogin: () => dispatch(openUserPage(DIALOG_PAGE_LOGIN)),
    onClickResendEmail: () => dispatch(openUserPage(DIALOG_PAGE_VERIFICATION_PAGE)),
    onClickChangePassword: () => dispatch(openUserPage(DIALOG_PAGE_CHANGE_PASSWORD)),
    onClickRequestCountryAccess: () => dispatch(openUserPage(DIALOG_PAGE_REQUEST_COUNTRY_ACCESS)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserDialog);
