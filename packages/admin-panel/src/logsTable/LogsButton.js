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
    <IconButton onClick={openModal}>
      <DescriptionIcon />
    </IconButton>
  );
};

LogsButtonComponent.propTypes = {
  openModal: PropTypes.func.isRequired,
};

LogsButtonComponent.defaultProps = {};

const mapDispatchToProps = (dispatch, { actionConfig, value: recordId, row }) => ({
  openModal: () => {
    dispatch(openLogsModal(actionConfig, recordId, row));
  },
});

const mergeProps = ({ ...stateProps }, { dispatch, ...dispatchProps }, { ...ownProps }) => {
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
  };
};

export const LogsButton = connect(null, mapDispatchToProps, mergeProps)(LogsButtonComponent);
