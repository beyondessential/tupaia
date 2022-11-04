/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import EditIcon from '@material-ui/icons/Edit';
import { IconButton } from '../widgets';
import { openBulkEditModal } from './actions';

export const BulkEditButtonComponent = ({ dispatch, value: recordId, actionConfig, row }) => {
  return (
    <IconButton
      id="bulk-edit-button"
      onClick={() => dispatch(openBulkEditModal(actionConfig, recordId, row))}
    >
      <EditIcon />
    </IconButton>
  );
};

BulkEditButtonComponent.propTypes = {
  actionConfig: PropTypes.PropTypes.shape({
    bulkGetEndpoint: PropTypes.string,
    bulkUpdateEndpoint: PropTypes.string,
    fields: PropTypes.array,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  row: PropTypes.object.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export const BulkEditButton = connect()(BulkEditButtonComponent);
