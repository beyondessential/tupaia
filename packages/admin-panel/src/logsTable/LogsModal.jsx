import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal } from '@tupaia/ui-components';
import { changeLogsTablePage, closeLogsModal } from './actions';
import { LogsTable } from './LogsTable';

export const LogsModalComponent = ({
  error,
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
    <Modal
      onClose={onDismiss}
      isOpen={isOpen}
      disableBackdropClick
      maxWidth="xl"
      title={title}
      error={error}
      isLoading={isLoading}
      buttons={[
        {
          disabled: isLoading,
          variant: 'outlined',
          onClick: onDismiss,
          text: error ? 'Dismiss' : 'Cancel',
        },
      ]}
    >
      <LogsTable
        logs={logs}
        logsCount={logsCount}
        page={page}
        logsPerPage={logsPerPage}
        onChangePage={onChangeLogsTablePage}
      />
    </Modal>
  );
};

LogsModalComponent.propTypes = {
  error: PropTypes.object,
  isLoading: PropTypes.bool,
  isOpen: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
  title: PropTypes.string,
  logs: PropTypes.arrayOf(PropTypes.string).isRequired,
  logsCount: PropTypes.number,
  page: PropTypes.number.isRequired,
  logsPerPage: PropTypes.number.isRequired,
  onChangeLogsTablePage: PropTypes.func.isRequired,
};

LogsModalComponent.defaultProps = {
  isLoading: false,
  error: null,
  logsCount: null,
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
