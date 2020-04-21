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

import SearchOverlay from '../SearchOverlay';
import { LoginForm } from '../../LoginForm';
import UserMenuOverlay from '../UserMenuOverlay';
import { ChangePasswordForm } from '../../ChangePasswordForm';
import { RequestResetPasswordForm } from '../../RequestResetPasswordForm';
import { RequestCountryAccessForm } from '../../RequestCountryAccessForm';
import { TopBar } from './TopBar';
import { delayMobileTapCallback } from '../../../utils';
import {
  goHome,
  changeOrgUnit,
  findLoggedIn,
  toggleSearchExpand,
  openUserPage,
  DIALOG_PAGE_USER_MENU,
  DIALOG_PAGE_CHANGE_PASSWORD,
  DIALOG_PAGE_REQUEST_RESET_PASSWORD,
  DIALOG_PAGE_RESET_PASSWORD,
  DIALOG_PAGE_REQUEST_COUNTRY_ACCESS,
} from '../../../actions';
import { SignupOverlay } from '../SignupOverlay';

const Container = styled.div`
  display: grid;
  grid-auto-flow: row;
`;

const HeaderBar = React.memo(props => {
  const {
    isUserLoggedIn,
    searchIsExpanded,
    onToggleUserMenuExpand,
    userMenuIsExpanded,
    changePasswordIsExpanded,
    resetPasswordIsExpanded,
    requestCountryAccessIsExpanded,
    dialogPage,
    isRequestingLogin,
    currentUserUsername,
    onToggleSearchExpand,
  } = props;
  const [isSignupOpen, openSignupOverlay] = React.useState(false);
  const [isLoginExpanded, toggleMenuExpanded] = React.useState(false);

  React.useEffect(() => {
    if (!isRequestingLogin) props.onRefreshCurrentUser();
  }, []);

  const handleOpenSignupOverlay = React.useCallback(() => openSignupOverlay(true), []);
  const handleCloseSignupOverlay = React.useCallback(() => openSignupOverlay(false), []);
  const handleToggleUserMenuExpand = React.useCallback(() => toggleMenuExpanded(!isLoginExpanded), [
    isLoginExpanded,
  ]);

  return (
    <Container>
      <TopBar
        currentUserUsername={currentUserUsername}
        isUserLoggedIn={isUserLoggedIn}
        onToggleSearchExpand={onToggleSearchExpand}
        toggleUserMenuExpand={onToggleUserMenuExpand}
        toggleMenuExpanded={handleToggleUserMenuExpand}
      />
      {isLoginExpanded && !isUserLoggedIn && (
        <LoginForm openSignupOverlay={handleOpenSignupOverlay} />
      )}
      {isSignupOpen && <SignupOverlay closeSignupOverlay={handleCloseSignupOverlay} />}
      {searchIsExpanded && <SearchOverlay />}
      {userMenuIsExpanded && <UserMenuOverlay />}
      {changePasswordIsExpanded && (
        <ChangePasswordForm useResetToken={dialogPage === DIALOG_PAGE_RESET_PASSWORD} />
      )}
      {resetPasswordIsExpanded && <RequestResetPasswordForm />}
      {requestCountryAccessIsExpanded && <RequestCountryAccessForm />}
    </Container>
  );
});

HeaderBar.propTypes = {
  searchIsExpanded: PropTypes.bool,
  userMenuIsExpanded: PropTypes.bool,
  changePasswordIsExpanded: PropTypes.bool,
  resetPasswordIsExpanded: PropTypes.bool,
  requestCountryAccessIsExpanded: PropTypes.bool,
  currentUserUsername: PropTypes.string,
  isUserLoggedIn: PropTypes.bool,
  onToggleSearchExpand: PropTypes.func.isRequired,
  onToggleUserMenuExpand: PropTypes.func.isRequired,
  onRefreshCurrentUser: PropTypes.func.isRequired,
  dialogPage: PropTypes.string.isRequired,
  isRequestingLogin: PropTypes.bool,
};

HeaderBar.defaultProps = {
  searchIsExpanded: false,
  userMenuIsExpanded: false,
  changePasswordIsExpanded: false,
  resetPasswordIsExpanded: false,
  requestCountryAccessIsExpanded: false,
  isRequestingLogin: false,
  currentUserUsername: '',
  isUserLoggedIn: false,
};

const mapStateToProps = state => {
  const { isExpanded } = state.searchBar;

  const {
    currentUserUsername,
    isUserLoggedIn,
    isDialogVisible,
    dialogPage,
    isRequestingLogin,
  } = state.authentication;

  return {
    searchIsExpanded: isExpanded,
    userMenuIsExpanded: isDialogVisible && dialogPage === DIALOG_PAGE_USER_MENU,
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
  onToggleSearchExpand: () => delayMobileTapCallback(() => dispatch(toggleSearchExpand())),
  onToggleUserMenuExpand: () =>
    delayMobileTapCallback(() => dispatch(openUserPage(DIALOG_PAGE_USER_MENU))),
  onRefreshCurrentUser: () => dispatch(findLoggedIn()),
  goHome: () => {
    dispatch(goHome());
    dispatch(changeOrgUnit());
  },
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
