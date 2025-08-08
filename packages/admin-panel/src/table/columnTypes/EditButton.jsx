import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import EditIcon from '@material-ui/icons/Edit';
import { loadEditor, openEditModal } from '../../editor/actions';
import { ColumnActionButton } from './ColumnActionButton';
import { useLinkWithSearchState } from '../../utilities';

export const EditButtonComponent = ({ onEdit, actionConfig, row }) => {
  const parsedLink = actionConfig?.link
    ? actionConfig.link.replace(/:id/g, row?.original?.id)
    : null;
  const { title = 'Edit record' } = actionConfig;
  const { to, newState } = useLinkWithSearchState(parsedLink);
  return (
    <ColumnActionButton
      className="edit-button"
      onClick={parsedLink ? null : onEdit}
      title={title}
      to={to}
      state={newState}
      component={parsedLink ? Link : 'button'}
    >
      <EditIcon />
    </ColumnActionButton>
  );
};

EditButtonComponent.propTypes = {
  onEdit: PropTypes.func.isRequired,
  actionConfig: PropTypes.object.isRequired,
  row: PropTypes.object.isRequired,
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  onEdit: () => {
    const recordId = ownProps.row.original.id;
    if (!ownProps.actionConfig?.link) {
      dispatch(loadEditor(ownProps.actionConfig, recordId));
    }
    dispatch(openEditModal(recordId));
  },
});

export const EditButton = connect(null, mapDispatchToProps)(EditButtonComponent);
