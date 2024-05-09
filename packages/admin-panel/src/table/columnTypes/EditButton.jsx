/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import EditIcon from '@material-ui/icons/Edit';
import { openEditModal, loadEditor } from '../../editor/actions';
import { ColumnActionButton } from './ColumnActionButton';

export const EditButtonComponent = ({ onEdit, actionConfig, row }) => {
  const parsedLink = actionConfig?.link
    ? actionConfig.link.replace(/:id/g, row?.original?.id)
    : null;
  return (
    <ColumnActionButton
      className="edit-button"
      onClick={parsedLink ? null : onEdit}
      title="Edit record"
      to={parsedLink}
      component={parsedLink ? Link : 'button'}
    >
      <EditIcon />
    </ColumnActionButton>
  );
};

EditButtonComponent.propTypes = {
  onEdit: PropTypes.func,
  actionConfig: PropTypes.object.isRequired,
  row: PropTypes.object.isRequired,
};

EditButtonComponent.defaultProps = {
  onEdit: () => {},
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  onEdit: () => {
    const recordId = ownProps.row.original.id;
    dispatch(openEditModal(recordId));
    // dispatch(openEditor({ ...ownProps.actionConfig, isLoading: true }, recordId));
  },
});

export const EditButton = connect(null, mapDispatchToProps)(EditButtonComponent);
