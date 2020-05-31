/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { closeEditModal, editField, saveEdits } from './actions';
import { getEditorState, getIsUnchanged } from './selectors';
import { AsyncModal } from '../widgets';
import { Editor } from './Editor';

export const EditModalComponent = props => {
  const {
    errorMessage,
    isLoading,
    onDismiss,
    onEditField,
    onSave,
    recordData,
    title,
    confirmLabel,
    fields,
    isUnchanged,
    allowNoChangeSave,
  } = props;
  const isConfirmDisabled = allowNoChangeSave ? false : isUnchanged;

  return (
    <AsyncModal
      isLoading={isLoading}
      errorMessage={errorMessage}
      confirmLabel={confirmLabel}
      dismissLabel="Cancel"
      title={title}
      renderContent={() =>
        fields && (
          <Editor
            fields={fields}
            recordData={recordData}
            onEditField={(fieldSource, newValue) =>
              onEditField(getFieldToEditFromSource(fieldSource), newValue)
            }
          />
        )
      }
      onConfirm={onSave}
      onDismiss={onDismiss}
      isConfirmDisabled={isConfirmDisabled}
    />
  );
};

EditModalComponent.propTypes = {
  errorMessage: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onEditField: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  recordData: PropTypes.object,
  title: PropTypes.string,
  confirmLabel: PropTypes.string,
  fields: PropTypes.array,
  isUnchanged: PropTypes.bool,
  allowNoChangeSave: PropTypes.bool,
};

EditModalComponent.defaultProps = {
  errorMessage: null,
  title: 'Edit',
  confirmLabel: 'Save',
  recordData: null,
  fields: null,
  isUnchanged: false,
  allowNoChangeSave: false,
};

const mapStateToProps = state => {
  return {
    ...getEditorState(state),
    isUnchanged: getIsUnchanged(state),
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onDismiss: () => dispatch(closeEditModal()),
    onEditField: (fieldKey, newValue) => dispatch(editField(fieldKey, newValue)),
    dispatch,
  };
};

const mergeProps = (
  { endpoint, editedFields, recordData, ...stateProps },
  { dispatch, ...dispatchProps },
  { onProcessDataForSave, ...ownProps },
) => ({
  ...ownProps,
  ...stateProps,
  ...dispatchProps,
  recordData: { ...recordData, ...editedFields }, // Include edits in visible record data
  onSave: () => {
    // If there is no record data, this is a new record
    const isNew = Object.keys(recordData).length === 0;
    const fieldValuesToSave = { ...editedFields };
    if (onProcessDataForSave) {
      onProcessDataForSave(fieldValuesToSave);
    }
    dispatch(saveEdits(endpoint, fieldValuesToSave, isNew));
  },
});

export const EditModal = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(EditModalComponent);

const getFieldToEditFromSource = source => {
  if (source.includes('.')) {
    return `${source.split('.')[0]}_id`;
  }
  return source;
};
