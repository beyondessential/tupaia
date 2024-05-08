/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
import keyBy from 'lodash.keyby';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Dialog, DialogFooter, DialogHeader } from '@tupaia/ui-components';
import { closeEditModal } from './actions';
import { FieldsEditor } from './FieldsEditor';
import { ModalContentProvider } from '../widgets';
import { UsedBy } from '../usedBy/UsedBy';
import { getExplodedFields } from '../utilities';
import { withConnectedEditor } from './withConnectedEditor';

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

export const EditModalComponent = withConnectedEditor(
  ({
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

    const FieldsComponentResolved = FieldsComponent ?? FieldsEditor;

    return (
      <Dialog onClose={onDismiss} open={isOpen} disableBackdropClick {...extraDialogProps}>
        <DialogHeader onClose={onDismiss} title={title} />
        <ModalContentProvider errorMessage={errorMessage} isLoading={isLoading}>
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
        </ModalContentProvider>
        <DialogFooter>
          <Button
            id="form-button-cancel"
            variant="outlined"
            onClick={onDismiss}
            disabled={isLoading}
          >
            {errorMessage ? dismissButtonText : cancelButtonText}
          </Button>
          <Button
            id="form-button-save"
            onClick={() => onSave(files)}
            disabled={!!errorMessage || isLoading || isUnchanged}
          >
            {saveButtonText}
          </Button>
        </DialogFooter>
      </Dialog>
    );
  },
);

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

const mapDispatchToProps = dispatch => ({
  onDismiss: () => dispatch(closeEditModal()),
});

export const EditModal = connect(null, mapDispatchToProps)(EditModalComponent);
