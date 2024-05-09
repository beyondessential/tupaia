/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Dialog, DialogFooter, DialogHeader } from '@tupaia/ui-components';
import { closeEditModal } from './actions';
import { FieldsEditor } from './FieldsEditor';
import { ModalContentProvider } from '../widgets';
import { UsedBy } from '../usedBy/UsedBy';
import { withConnectedEditor } from './withConnectedEditor';
import { useEditFiles } from './useEditFiles';

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
    loadEditor,
    actionConfig,
    recordId,
  }) => {
    const { files, handleSetFormFile } = useEditFiles(fields, onEditField);

    const FieldsComponentResolved = FieldsComponent ?? FieldsEditor;
    useEffect(() => {
      if (isOpen) {
        loadEditor(actionConfig, recordId);
      }
    }, [isOpen]);

    return (
      <Dialog onClose={onDismiss} open={isOpen} disableBackdropClick {...extraDialogProps}>
        <DialogHeader onClose={onDismiss} title={title} />
        <ModalContentProvider errorMessage={errorMessage} isLoading={isLoading}>
          <FieldsComponentResolved
            fields={fields}
            isLoading={isLoading}
            recordData={recordData}
            onEditField={onEditField}
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
