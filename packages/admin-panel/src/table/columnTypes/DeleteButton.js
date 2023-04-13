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
import { useResourcePageContext } from '../../context';

const DeleteButtonComponent = ({ dispatch, value, actionConfig, reduxId }) => {
  const { humanFriendlyModelName } = useResourcePageContext();
  const title = actionConfig.title ?? `Delete ${humanFriendlyModelName}?`;
  return (
    <IconButton
      className="delete-button"
      onClick={() =>
        dispatch(
          requestDeleteRecord(
            reduxId,
            actionConfig.endpoint,
            value,
            title,
            actionConfig.confirmMessage,
          ),
        )
      }
    >
      <DeleteIcon />
    </IconButton>
  );
};

DeleteButtonComponent.propTypes = {
  actionConfig: PropTypes.PropTypes.shape({
    endpoint: PropTypes.string,
    confirmMessage: PropTypes.string,
    title: PropTypes.string,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  reduxId: PropTypes.string.isRequired,
};

export const DeleteButton = connect()(DeleteButtonComponent);
