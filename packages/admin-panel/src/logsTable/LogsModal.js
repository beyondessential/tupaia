/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Dialog, DialogFooter, DialogHeader } from '@tupaia/ui-components';
import { changeLogsTablePage, closeLogsModal } from './actions';
import { ModalContentProvider } from '../widgets';
import { LogsTable } from './LogsTable';

export const LogsModalComponent = ({
  errorMessage,
  logs,
  logsCount,
  page,
  logsPerPage,
  onChangeLogsTablePage,
  isLoading,
  isOpen,
  onDismiss,
  title,
}) => {
  return (
    <Dialog onClose={onDismiss} open={isOpen} disableBackdropClick maxWidth="xl">
      <DialogHeader onClose={onDismiss} title={title} />
      <ModalContentProvider errorMessage={errorMessage} isLoading={isLoading}>
        <LogsTable
          logs={logs}
          logsCount={logsCount}
          page={page}
          logsPerPage={logsPerPage}
          onChangePage={onChangeLogsTablePage}
        />
      </ModalContentProvider>
      <DialogFooter>
        <Button variant="outlined" onClick={onDismiss} disabled={isLoading}>
          {errorMessage ? 'Dismiss' : 'Cancel'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

LogsModalComponent.propTypes = {
  errorMessage: PropTypes.string,
  isLoading: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
  title: PropTypes.string,
  logs: PropTypes.arrayOf(PropTypes.string).isRequired,
  logsCount: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  logsPerPage: PropTypes.number.isRequired,
  onChangeLogsTablePage: PropTypes.func.isRequired,
};

LogsModalComponent.defaultProps = {
  errorMessage: null,
  title: 'Logs',
};

const mapStateToProps = state => ({
  ...state.logs,
});

const mapDispatchToProps = dispatch => ({
  onDismiss: () => dispatch(closeLogsModal()),
  onChangeLogsTablePage: page => dispatch(changeLogsTablePage(page)),
  dispatch,
});

const mergeProps = ({ ...stateProps }, { dispatch, ...dispatchProps }, { ...ownProps }) => {
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
  };
};

export const LogsModal = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(LogsModalComponent);
