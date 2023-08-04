/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DescriptionIcon from '@material-ui/icons/Description';
import { IconButton } from '../widgets';
import { openLogsModal } from './actions';

export const LogsButtonComponent = props => {
  const { openModal } = props;
  return (
    <IconButton className="logs-button" onClick={openModal}>
      <DescriptionIcon />
    </IconButton>
  );
};

LogsButtonComponent.propTypes = {
  openModal: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, { actionConfig, value: recordId, row }) => ({
  openModal: () => {
    dispatch(openLogsModal(actionConfig, recordId, row));
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
