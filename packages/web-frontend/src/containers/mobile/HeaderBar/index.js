/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';

import { LoginForm } from '../../LoginForm';
import UserMenuOverlay from '../UserMenuOverlay';
import { ChangePasswordForm } from '../../ChangePasswordForm';
import { RequestResetPasswordForm } from '../../RequestResetPasswordForm';
import { RequestCountryAccessForm } from '../../RequestCountryAccessForm';
import { TopBar } from './TopBar';
import { delayMobileTapCallback } from '../../../utils';
import {
  findLoggedIn,
  openUserPage,
  DIALOG_PAGE_USER_MENU,
  DIALOG_PAGE_CHANGE_PASSWORD,
  DIALOG_PAGE_REQUEST_RESET_PASSWORD,
  DIALOG_PAGE_RESET_PASSWORD,
  DIALOG_PAGE_REQUEST_COUNTRY_ACCESS,
  DIALOG_PAGE_ONE_TIME_LOGIN,
  closeUserPage,
} from '../../../actions';
import { SignupOverlay } from '../SignupOverlay';
import { OneTimeLoginForm } from '../../ResetPasswordOneTimeLoginForm';
import { LightThemeProvider } from '../../../styles/LightThemeProvider';
import { LOGIN_TYPES } from '../../../constants';

const Container = styled.div`
  display: grid;
  grid-auto-flow: row;
`;

const MobileFormHeader = styled.div`
  text-align: center;
  color: white;
  padding: 1.5rem 0;
`;

const MobileFormHeading = styled(Typography)`
  font-weight: 500;
  font-size: 20px;
  line-height: 23px;
`;

const HeaderBar = React.memo(props => {
  const {
    isUserLoggedIn,
    onToggleUserMenuExpand,
    userMenuIsExpanded,
    isOneTimeLoginExpanded,
    changePasswordIsExpanded,
    resetPasswordIsExpanded,
    requestCountryAccessIsExpanded,
    dialogPage,
    isRequestingLogin,
    currentUserUsername,
  } = props;
  const [isSignupOpen, openSignupOverlay] = React.useState(false);
  const [isLoginExpanded, toggleMenuExpanded] = React.useState(false);

  React.useEffect(() => {
    if (!isRequestingLogin) props.onRefreshCurrentUser();
  }, []);

  const handleOpenSignupOverlay = React.useCallback(() => openSignupOverlay(true), []);
  const handleCloseSignupOverlay = React.useCallback(() => openSignupOverlay(false), []);
  const handleToggleUserMenuExpand = React.useCallback(
    () => toggleMenuExpanded(!isLoginExpanded),
    [isLoginExpanded],
  );

  return (
    <Container>
      <TopBar
        currentUserUsername={currentUserUsername}
        isUserLoggedIn={isUserLoggedIn}
        toggleUserMenuExpand={onToggleUserMenuExpand}
        toggleMenuExpanded={handleToggleUserMenuExpand}
      />
      {isLoginExpanded && !isUserLoggedIn && (
        <LoginForm openSignupOverlay={handleOpenSignupOverlay} />
      )}
      {isOneTimeLoginExpanded && !isLoginExpanded && (
        <>
          <MobileFormHeader>
            <MobileFormHeading variant="h3">Reset your password</MobileFormHeading>
          </MobileFormHeader>
          <LightThemeProvider>
            <OneTimeLoginForm
              onNavigateToRequestPasswordReset={() => {
                // This prop can be changed to a simple link/removed after url based routing implemented in #770
                toggleMenuExpanded(true);
              }}
            />
          </LightThemeProvider>
        </>
      )}
      {isSignupOpen && <SignupOverlay closeSignupOverlay={handleCloseSignupOverlay} />}
      {userMenuIsExpanded && <UserMenuOverlay />}
      {changePasswordIsExpanded && (
        <>
          <MobileFormHeader>
            <MobileFormHeading variant="h3">Reset your password</MobileFormHeading>
          </MobileFormHeader>
          <LightThemeProvider>
            <ChangePasswordForm useResetToken={dialogPage === DIALOG_PAGE_RESET_PASSWORD} />
          </LightThemeProvider>
        </>
      )}
      {resetPasswordIsExpanded && <RequestResetPasswordForm />}
      {requestCountryAccessIsExpanded && (
        <>
          <MobileFormHeader>
            <MobileFormHeading variant="h3">Request access to countries</MobileFormHeading>
          </MobileFormHeader>
          <LightThemeProvider>
            <RequestCountryAccessForm />
          </LightThemeProvider>
        </>
      )}
    </Container>
  );
});

HeaderBar.propTypes = {
  userMenuIsExpanded: PropTypes.bool,
  isOneTimeLoginExpanded: PropTypes.bool,
  changePasswordIsExpanded: PropTypes.bool,
  resetPasswordIsExpanded: PropTypes.bool,
  requestCountryAccessIsExpanded: PropTypes.bool,
  currentUserUsername: PropTypes.string,
  isUserLoggedIn: PropTypes.bool,
  onToggleUserMenuExpand: PropTypes.func.isRequired,
  onRefreshCurrentUser: PropTypes.func.isRequired,
  dialogPage: PropTypes.string.isRequired,
  isRequestingLogin: PropTypes.bool,
};

HeaderBar.defaultProps = {
  userMenuIsExpanded: false,
  isOneTimeLoginExpanded: false,
  changePasswordIsExpanded: false,
  resetPasswordIsExpanded: false,
  requestCountryAccessIsExpanded: false,
  isRequestingLogin: false,
  currentUserUsername: '',
  isUserLoggedIn: false,
};

const mapStateToProps = state => {
  const { currentUserUsername, isUserLoggedIn, isDialogVisible, dialogPage, isRequestingLogin } =
    state.authentication;

  return {
    userMenuIsExpanded: isDialogVisible && dialogPage === DIALOG_PAGE_USER_MENU,
    isOneTimeLoginExpanded: isDialogVisible && dialogPage === DIALOG_PAGE_ONE_TIME_LOGIN,
    changePasswordIsExpanded:
      (isDialogVisible && dialogPage === DIALOG_PAGE_CHANGE_PASSWORD) ||
      dialogPage === DIALOG_PAGE_RESET_PASSWORD,
    resetPasswordIsExpanded: isDialogVisible && dialogPage === DIALOG_PAGE_REQUEST_RESET_PASSWORD,
    requestCountryAccessIsExpanded:
      isDialogVisible && dialogPage === DIALOG_PAGE_REQUEST_COUNTRY_ACCESS,
    currentUserUsername,
    isUserLoggedIn,
    isRequestingLogin,
    dialogPage,
  };
};

const mapDispatchToProps = dispatch => ({
  onToggleUserMenuExpand: () =>
    delayMobileTapCallback(() => dispatch(openUserPage(DIALOG_PAGE_USER_MENU))),
  onUserMenuCollapse: () => dispatch(closeUserPage()),
  onRefreshCurrentUser: () => dispatch(findLoggedIn(LOGIN_TYPES.MANUAL)),
  dispatch,
});

const mergeProps = (
  { isRequestingLogin, ...stateProps },
  { dispatch, ...dispatchProps },
  ownProps,
) => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps,
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(HeaderBar);
