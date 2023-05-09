/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * Container for Change Password Form
 */
import { connect } from 'react-redux';

import { attemptChangePassword, closeUserPage, goHome } from '../../actions';
import { ChangePasswordFormComponent } from './ChangePasswordFormComponent';
import { PASSWORD_RESET_PREFIX } from '../../historyNavigation/constants';

const mapStateToProps = state => {
  const {
    changePasswordFailedMessage,
    isRequestingChangePassword,
    hasChangePasswordCompleted,
    passwordResetToken,
  } = state.changePassword;

  return {
    changePasswordFailedMessage,
    isRequestingChangePassword,
    hasChangePasswordCompleted,
    passwordResetToken,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onAttemptChangePassword: ({ oldPassword, password, passwordConfirm, passwordResetToken }) =>
      dispatch(attemptChangePassword(oldPassword, password, passwordConfirm, passwordResetToken)),
    onClose: () => {
      dispatch(closeUserPage());
      if (ownProps.useResetToken) dispatch(goHome());
    },
  };
};

export const ChangePasswordForm = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ChangePasswordFormComponent);
