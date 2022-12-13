/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DeleteIcon from '@material-ui/icons/Delete';
import { IconButton } from '../../widgets';
import { requestDeleteRecord } from '../actions';

const DeleteButtonComponent = ({ dispatch, value, actionConfig, reduxId }) => (
  <IconButton
    className="delete-button"
    onClick={() =>
      dispatch(
        requestDeleteRecord(reduxId, actionConfig.endpoint, value, actionConfig.confirmMessage),
      )
    }
  >
    <DeleteIcon />
  </IconButton>
);

DeleteButtonComponent.propTypes = {
  actionConfig: PropTypes.PropTypes.shape({
    endpoint: PropTypes.string,
    confirmMessage: PropTypes.string,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  reduxId: PropTypes.string.isRequired,
};

export const DeleteButton = connect()(DeleteButtonComponent);
