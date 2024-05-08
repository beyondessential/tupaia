/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DeleteIcon from '@material-ui/icons/Delete';
import { requestDeleteRecord } from '../actions';
import { ColumnActionButton } from './ColumnActionButton';

const DeleteButtonComponent = ({ dispatch, actionConfig, reduxId, row }) => (
  <ColumnActionButton
    className="delete-button"
    title="Delete record"
    onClick={() =>
      dispatch(
        requestDeleteRecord(
          reduxId,
          actionConfig.endpoint,
          row.original.id,
          actionConfig.confirmMessage,
        ),
      )
    }
  >
    <DeleteIcon />
  </ColumnActionButton>
);

DeleteButtonComponent.propTypes = {
  actionConfig: PropTypes.PropTypes.shape({
    endpoint: PropTypes.string,
    confirmMessage: PropTypes.string,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  reduxId: PropTypes.string.isRequired,
  row: PropTypes.object.isRequired,
};

export const DeleteButton = connect()(DeleteButtonComponent);
