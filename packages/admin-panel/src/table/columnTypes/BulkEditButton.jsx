/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import EditIcon from '@material-ui/icons/Edit';
import { openBulkEditModal } from '../../editor/actions';
import { ColumnActionButton } from './ColumnActionButton';

export const BulkEditButtonComponent = ({ dispatch, actionConfig, row }) => {
  const recordId = row.id;
  return (
    <ColumnActionButton
      id="page-button-bulk-edit"
      title="Bulk edit"
      onClick={() => dispatch(openBulkEditModal(actionConfig, recordId, row.original))}
    >
      <EditIcon />
    </ColumnActionButton>
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
};

export const BulkEditButton = connect()(BulkEditButtonComponent);
