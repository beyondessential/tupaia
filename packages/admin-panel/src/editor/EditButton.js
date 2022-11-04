/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import EditIcon from '@material-ui/icons/Edit';
import { IconButton } from '../widgets';
import { openEditModal } from './actions';
import { fetchUsedBy } from '../usedBy';

export const EditButtonComponent = ({ onEdit }) => (
  <IconButton className="edit-button" onClick={onEdit}>
    <EditIcon />
  </IconButton>
);

EditButtonComponent.propTypes = {
  onEdit: PropTypes.func,
};

EditButtonComponent.defaultProps = {
  onEdit: () => {},
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  onEdit: () => {
    const recordId = ownProps.value;
    dispatch(openEditModal(ownProps.actionConfig, recordId));
    if (ownProps.actionConfig?.displayUsedBy) {
      dispatch(fetchUsedBy(ownProps.actionConfig.recordType, recordId));
    }
  },
});

export const EditButton = connect(null, mapDispatchToProps)(EditButtonComponent);
