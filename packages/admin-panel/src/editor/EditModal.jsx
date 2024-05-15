/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
import keyBy from 'lodash.keyby';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { closeEditModal, editField, saveEdits } from './actions';
import { getEditorState, getIsUnchanged } from './selectors';
import { Editor } from './Editor';
import { UsedBy } from '../usedBy/UsedBy';
import { getExplodedFields } from '../utilities';
import { Modal } from '../widgets';

const getFieldSourceToEdit = field => {
  const { source, editConfig = {} } = field;
  if (editConfig.optionsEndpoint) {
    if (editConfig.sourceKey) {
      return editConfig.sourceKey;
    }
    const sourceComponents = source.split('.');
    if (sourceComponents.length > 1) {
      const [resource] = sourceComponents;
      return `${resource}_id`;
    }
  }
  return source;
};

export const EditModalComponent = ({
  error,
  isOpen,
  isLoading,
  onDismiss,
  onEditField,
  onSave,
  recordData,
  title,
  fields,
  FieldsComponent,
  isUnchanged,
  displayUsedBy,
  usedByConfig,
  dismissButtonText,
  cancelButtonText,
  saveButtonText,
  extraDialogProps,
}) => {
  // key the fields by their source so we can easily find the field to edit. Use the exploded fields so that any subfields are placed into the top level of the array
  const fieldsBySource = keyBy(getExplodedFields(fields), 'source');

  // Files cannot be stored in redux (https://redux.js.org/style-guide/#do-not-put-non-serializable-values-in-state-or-actions)
  // So instead we keep a map of fieldKey -> File, and store only the filename in redux.
  const [files, setFiles] = useState({});
  const handleSetFormFile = (inputKey, { fileName, file }) => {
    setFiles({
      ...files,
      [inputKey]: file,
    });
    onEditField(inputKey, fileName);
  };
  useEffect(() => {
    // Rely on the fact that opening/closing the modal clears `fields` to make sure that `files` gets wiped between forms.
    setFiles({});
  }, [fields]);

  const FieldsComponentResolved = FieldsComponent ?? Editor;

  const buttons = [
    {
      onClick: onDismiss,
      text: error ? dismissButtonText : cancelButtonText,
      disabled: isLoading,
      variant: 'outlined',
      id: 'form-button-cancel',
    },
    {
      onClick: () => onSave(files),
      id: 'form-button-save',
      text: saveButtonText,
      disabled: !!error || isLoading || isUnchanged,
    },
  ];

  return (
    <Modal
      error={error}
      isLoading={isLoading}
      onClose={onDismiss}
      isOpen={isOpen}
      disableBackdropClick
      title={title}
      buttons={buttons}
      {...extraDialogProps}
    >
      <FieldsComponentResolved
        fields={fields}
        isLoading={isLoading}
        recordData={recordData}
        onEditField={(fieldSource, newValue) => {
          const fieldSourceToEdit = getFieldSourceToEdit(fieldsBySource[fieldSource]);
          return onEditField(fieldSourceToEdit, newValue);
        }}
        onSetFormFile={handleSetFormFile}
      />
      {displayUsedBy && <UsedBy {...usedByConfig} />}
    </Modal>
  );
};

EditModalComponent.propTypes = {
  error: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onEditField: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  recordData: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  title: PropTypes.string,
  fields: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  FieldsComponent: PropTypes.elementType,
  isUnchanged: PropTypes.bool,
  displayUsedBy: PropTypes.bool,
  usedByConfig: PropTypes.object,
  dismissButtonText: PropTypes.string,
  cancelButtonText: PropTypes.string,
  saveButtonText: PropTypes.string,
  extraDialogProps: PropTypes.object,
};

EditModalComponent.defaultProps = {
  error: null,
  title: 'Edit',
  recordData: null,
  FieldsComponent: null,
  isUnchanged: false,
  displayUsedBy: false,
  usedByConfig: {},
  dismissButtonText: 'Dismiss',
  cancelButtonText: 'Cancel',
  saveButtonText: 'Save',
  extraDialogProps: null,
};

const mapStateToProps = state => ({
  ...getEditorState(state),
  isUnchanged: getIsUnchanged(state),
  usedByConfig: {
    usedBy: state.usedBy.byRecordId[state.editor.recordId] ?? [],
    usedByIsLoading: state.usedBy.isLoading,
    usedByErrorMessage: state.usedBy.errorMessage,
  },
});

const mapDispatchToProps = dispatch => ({
  onDismiss: () => dispatch(closeEditModal()),
  onEditField: (fieldKey, newValue) => dispatch(editField(fieldKey, newValue)),
  dispatch,
});

const processRecordData = (recordData, fields) => {
  if (Array.isArray(recordData) && Array.isArray(fields)) {
    const [firstRecord] = recordData;
    return fields.reduce((obj, field) => {
      const value = field.bulkAccessor ? field.bulkAccessor(recordData) : firstRecord[field.source];
      return { [field.source]: value, ...obj };
    }, {});
  }

  return recordData;
};

const mergeProps = (
  {
    endpoint,
    editedFields,
    recordData,
    usedByConfig: usedByConfigInMapStateProps,
    initialValues,
    ...stateProps
  },
  { dispatch, ...dispatchProps },
  { onProcessDataForSave, usedByConfig: usedByConfigInOwnProps, ...ownProps },
) => {
  const usedByConfig = { ...usedByConfigInOwnProps, ...usedByConfigInMapStateProps };

  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    editedFields,
    recordData: {
      ...processRecordData(recordData, stateProps.fields),
      ...initialValues,
      ...editedFields,
    }, // Include edits in visible record data
    onSave: files => {
      // If there is no record data, this is a new record
      const isNew = Object.keys(recordData).length === 0;
      let fieldValuesToSave = isNew ? { ...initialValues, ...editedFields } : { ...editedFields };
      if (onProcessDataForSave) {
        fieldValuesToSave = onProcessDataForSave(fieldValuesToSave, recordData);
      }
      dispatch(saveEdits(endpoint, fieldValuesToSave, isNew, files));
    },
    usedByConfig,
  };
};

export const EditModal = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(EditModalComponent);
