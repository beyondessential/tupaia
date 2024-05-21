/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import EditIcon from '@material-ui/icons/Edit';
import { openEditModal } from '../../editor/actions';
import { fetchUsedBy } from '../../usedBy';
import { ColumnActionButton } from './ColumnActionButton';

export const EditButtonComponent = ({ onEdit }) => (
  <ColumnActionButton className="edit-button" onClick={onEdit} title="Edit record">
    <EditIcon />
  </ColumnActionButton>
);

EditButtonComponent.propTypes = {
  onEdit: PropTypes.func,
};

EditButtonComponent.defaultProps = {
  onEdit: () => {},
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  onEdit: () => {
    const recordId = ownProps.row.original.id;
    dispatch(openEditModal({ ...ownProps.actionConfig, isLoading: true }, recordId));
    if (ownProps.actionConfig?.displayUsedBy) {
      dispatch(fetchUsedBy(ownProps.actionConfig.recordType, recordId));
    }
  },
});

export const EditButton = connect(null, mapDispatchToProps)(EditButtonComponent);
