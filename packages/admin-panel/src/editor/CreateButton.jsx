import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadEditor, openEditModal } from './actions';
import { CreateActionButton } from './ActionButton';

export const CreateButtonComponent = ({ label, openCreateModal }) => {
  return <CreateActionButton onClick={openCreateModal}>{label}</CreateActionButton>;
};

CreateButtonComponent.propTypes = {
  openCreateModal: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

const mapDispatchToProps = (dispatch, { actionConfig }) => ({
  openCreateModal: () => {
    dispatch(loadEditor(actionConfig));
    dispatch(openEditModal());
  },
});

export const CreateButton = connect(null, mapDispatchToProps)(CreateButtonComponent);
