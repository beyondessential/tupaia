/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import keyBy from 'lodash.keyby';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Dialog, DialogFooter, DialogHeader } from '@tupaia/ui-components';
import { closeEditModal, editField, saveEdits } from './actions';
import { getEditorState, getIsUnchanged } from './selectors';
import { Editor } from './Editor';
import { ModalContentProvider } from '../widgets';
import { UsedBy } from '../usedBy/UsedBy';

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
  errorMessage,
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
  const fieldsBySource = keyBy(fields, 'source');

  return (
    <Dialog onClose={onDismiss} open={isOpen} disableBackdropClick {...extraDialogProps}>
      <DialogHeader onClose={onDismiss} title={title} />
      <ModalContentProvider errorMessage={errorMessage} isLoading={isLoading}>
        <>
          {!FieldsComponent && fields.length > 0 && (
            <Editor
              fields={fields}
              recordData={recordData}
              onEditField={(fieldSource, newValue) => {
                const fieldSourceToEdit = getFieldSourceToEdit(fieldsBySource[fieldSource]);
                return onEditField(fieldSourceToEdit, newValue);
              }}
            />
          )}
          {FieldsComponent && (
            <FieldsComponent
              recordData={recordData}
              onEditField={(fieldSource, newValue) => {
                const fieldSourceToEdit = getFieldSourceToEdit(fieldsBySource[fieldSource]);
                return onEditField(fieldSourceToEdit, newValue);
              }}
            />
          )}
          {displayUsedBy && <UsedBy {...usedByConfig} />}
        </>
      </ModalContentProvider>
      <DialogFooter>
        <Button id="form-button-cancel" variant="outlined" onClick={onDismiss} disabled={isLoading}>
          {errorMessage ? dismissButtonText : cancelButtonText}
        </Button>
        <Button
          id="form-button-save"
          onClick={onSave}
          disabled={!!errorMessage || isLoading || isUnchanged}
        >
          {saveButtonText}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

EditModalComponent.propTypes = {
  errorMessage: PropTypes.string,
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
  errorMessage: null,
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
  { endpoint, editedFields, recordData, usedByConfig: usedByConfigInMapStateProps, ...stateProps },
  { dispatch, ...dispatchProps },
  { onProcessDataForSave, usedByConfig: usedByConfigInOwnProps, ...ownProps },
) => {
  const usedByConfig = { ...usedByConfigInOwnProps, ...usedByConfigInMapStateProps };

  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    editedFields,
    recordData: { ...processRecordData(recordData, stateProps.fields), ...editedFields }, // Include edits in visible record data
    onSave: () => {
      // If there is no record data, this is a new record
      const isNew = Object.keys(recordData).length === 0;
      let fieldValuesToSave = { ...editedFields };
      if (onProcessDataForSave) {
        fieldValuesToSave = onProcessDataForSave(fieldValuesToSave, recordData);
      }
      dispatch(saveEdits(endpoint, fieldValuesToSave, isNew));
    },
    endpoint,
    usedByConfig,
  };
};

export const EditModal = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(EditModalComponent);
