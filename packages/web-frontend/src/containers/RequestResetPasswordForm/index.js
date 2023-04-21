/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * Container for Reset Password Form
 */
import { connect } from 'react-redux';

import { RequestResetPasswordFormComponent } from './RequestResetPasswordFormComponent';
import { attemptResetPassword, closeUserPage } from '../../actions';

const mapStateToProps = state => {
  const { resetPasswordFailedMessage, isRequestingResetPassword, hasResetPasswordCompleted } =
    state.resetPassword;

  return {
    resetPasswordFailedMessage,
    isRequestingResetPassword,
    hasResetPasswordCompleted,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onAttemptResetPassword: email => dispatch(attemptResetPassword(email)),
    onClose: () => dispatch(closeUserPage()), // Timeout in order to show button press effect.
  };
};

export const RequestResetPasswordForm = connect(
  mapStateToProps,
  mapDispatchToProps,
)(RequestResetPasswordFormComponent);
