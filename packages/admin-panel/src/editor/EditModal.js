/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';
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
    fields,
    isUnchanged,
  } = props;
  const fieldsBySource = keyBy(fields, 'source');

  return (
    <AsyncModal
      isLoading={isLoading}
      errorMessage={errorMessage}
      confirmLabel={'Save'}
      dismissLabel={'Cancel'}
      title={title}
      renderContent={() =>
        fields && (
          <Editor
            fields={fields}
            recordData={recordData}
            onEditField={(fieldSource, newValue) => {
              const fieldSourceToEdit = getFieldSourceToEdit(fieldsBySource[fieldSource]);
              return onEditField(fieldSourceToEdit, newValue);
            }}
          />
        )
      }
      onConfirm={onSave}
      onDismiss={onDismiss}
      isConfirmDisabled={isUnchanged}
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
  fields: PropTypes.array,
  isUnchanged: PropTypes.bool,
};

EditModalComponent.defaultProps = {
  errorMessage: null,
  title: 'Hello',
  recordData: null,
  fields: null,
  isUnchanged: false,
};

const mapStateToProps = state => ({
  ...getEditorState(state),
  isUnchanged: getIsUnchanged(state),
});

const mapDispatchToProps = dispatch => ({
  onDismiss: () => dispatch(closeEditModal()),
  onEditField: (fieldKey, newValue) => dispatch(editField(fieldKey, newValue)),
  dispatch,
});

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

const getFieldSourceToEdit = field => {
  const { source, editConfig = {} } = field;
  return editConfig.optionsEndpoint ? `${source.split('.')[0]}_id` : source;
};
