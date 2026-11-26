import React from 'react';
import PropTypes from 'prop-types';
import { Link, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import EditIcon from '@material-ui/icons/Edit';
import { loadEditor, openEditModal } from '../../editor/actions';
import { ColumnActionButton } from './ColumnActionButton';
import { useLinkWithSearchState } from '../../utilities';

export const EditButtonComponent = ({ onEdit, actionConfig, row }) => {
  // Scoped resources (e.g. Surveys, Entities) render under a `/:projectCode`
  // prefix, but their edit-link configs are declared without it. Prepend the
  // active project so the Link resolves to the scoped route instead of falling
  // through to the all-data section (which lands on Data Elements).
  const { projectCode } = useParams();
  const parsedLink = actionConfig?.link
    ? actionConfig.link.replace(/:id/g, row?.original?.id)
    : null;
  const scopedLink = parsedLink && projectCode ? `/${projectCode}${parsedLink}` : parsedLink;
  const { title = 'Edit record' } = actionConfig;
  const { to, newState } = useLinkWithSearchState(scopedLink);
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
