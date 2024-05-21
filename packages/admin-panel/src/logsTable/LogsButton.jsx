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

export const LogsButtonComponent = props => {
  const { openModal } = props;
  return (
    <ColumnActionButton className="logs-button" onClick={openModal}>
      <DescriptionIcon />
    </ColumnActionButton>
  );
};

LogsButtonComponent.propTypes = {
  openModal: PropTypes.func.isRequired,
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
