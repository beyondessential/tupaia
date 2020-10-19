/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { connect } from 'react-redux';

import { WelcomePage } from './WelcomePage';
import { AUTH_STATUSES } from './constants';
import { logout } from './actions';
import { getIsSyncing, getSyncTotal, getSyncProgress } from '../sync/selectors';

const { AUTHENTICATED, AUTHENTICATING, UNAUTHENTICATED, ERROR } = AUTH_STATUSES;

/**
 * Determines what label is displayed in the login button
 */
function getSyncMessage(
  authStatus,
  errorMessage,
  syncProgressMessage = '',
  progress = 0,
  total = 0,
) {
  switch (authStatus) {
    case AUTHENTICATING:
      if (progress > 0 && total > 0) {
        const percentage = Math.ceil((progress / total) * 100);

        return `Syncing ${percentage}%`;
      }

      return syncProgressMessage || 'Logging in';

    case AUTHENTICATED:
      return 'Success!';

    case ERROR:
      return errorMessage || 'Error';

    case UNAUTHENTICATED:
    default:
      return 'Logging in...';
  }
}

function mapStateToProps(state) {
  const { status, errorMessage } = state.authentication;
  const { progressMessage, progress, total } = state.sync;

  return {
    syncMessage: getSyncMessage(status, errorMessage, progressMessage, progress, total),
    total: getSyncTotal(state),
    progress: getSyncProgress(state),
    isSyncing: getIsSyncing(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onCancel: () => dispatch(logout()),
  };
}

const WelcomeContainer = connect(mapStateToProps, mapDispatchToProps)(WelcomePage);

export { WelcomeContainer };
