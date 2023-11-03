/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { connect } from 'react-redux';
import { SyncPage } from './SyncPage';
import { synchroniseDatabase } from './actions';
import {
  getIsSyncing,
  getSyncTotal,
  getSyncProgress,
  getLastSyncDate,
  getErrorMessage,
  getSyncProgressMessage,
} from './selectors';

function mapStateToProps(state) {
  return {
    total: getSyncTotal(state),
    progress: getSyncProgress(state),
    isSyncing: getIsSyncing(state),
    lastSyncDate: getLastSyncDate(state),
    errorMessage: getErrorMessage(state),
    progressMessage: getSyncProgressMessage(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onPressManualSync: () => dispatch(synchroniseDatabase()),
  };
}

const SyncContainer = connect(mapStateToProps, mapDispatchToProps)(SyncPage);

export { SyncContainer };
