/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DescriptionIcon from '@material-ui/icons/Description';
import { openLogsModal } from './actions';
import { ColumnActionButton } from '../table/columnTypes/ColumnActionButton';
import { makeSubstitutionsInString } from '../utilities';

export const LogsButtonComponent = props => {
  const { openModal, actionConfig, row } = props;
  const { title = 'View logs' } = actionConfig;
  return (
    <ColumnActionButton
      className="logs-button"
      onClick={openModal}
      title={makeSubstitutionsInString(title, row.original)}
    >
      <DescriptionIcon />
    </ColumnActionButton>
  );
};

LogsButtonComponent.propTypes = {
  openModal: PropTypes.func.isRequired,
  actionConfig: PropTypes.object.isRequired,
  row: PropTypes.object.isRequired,
};

const mapDispatchToProps = (dispatch, { actionConfig, value: recordId, row }) => ({
  openModal: () => {
    dispatch(openLogsModal(actionConfig, recordId, row.original));
  },
});

const mergeProps = ({ ...stateProps }, { ...dispatchProps }, { ...ownProps }) => {
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
  };
};

export const LogsButton = connect(null, mapDispatchToProps, mergeProps)(LogsButtonComponent);
