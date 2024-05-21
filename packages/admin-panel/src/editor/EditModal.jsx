/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { dismissEditor } from './actions';
import { UsedBy } from '../usedBy/UsedBy';
import { Modal } from '../widgets';
import { useEditFiles } from './useEditFiles';
import { FieldsEditor } from './FieldsEditor';
import { withConnectedEditor } from './withConnectedEditor';
import { useValidationScroll } from './useValidationScroll';

export const EditModalComponent = withConnectedEditor(
  ({
    errorMessage,
    isOpen,
    isLoading,
    onDismiss,
    onEditField,
    onSave,
    recordData,
    title = 'Edit',
    fields,
    FieldsComponent,
    isUnchanged,
    displayUsedBy,
    usedByConfig,
    dismissButtonText,
    cancelButtonText,
    saveButtonText,
    extraDialogProps,
    validationErrors,
  }) => {
    const { files, handleSetFormFile } = useEditFiles(fields, onEditField);

    const FieldsComponentResolved = FieldsComponent ?? FieldsEditor;

    const handleSave = () => {
      onSave(files, onDismiss);
    };

    const { onEditWithTouched, onSaveWithTouched } = useValidationScroll(
      handleSave,
      onEditField,
      validationErrors,
    );
    const buttons = [
      {
        onClick: onDismiss,
        text: errorMessage ? dismissButtonText : cancelButtonText,
        disabled: isLoading,
        variant: 'outlined',
        id: 'form-button-cancel',
      },
      {
        onClick: onSaveWithTouched,
        id: 'form-button-save',
        text: saveButtonText,
        disabled: !!errorMessage || isLoading || isUnchanged,
      },
    ];

    return (
      <Modal
        errorMessage={errorMessage}
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
          onEditField={onEditWithTouched}
          onSetFormFile={handleSetFormFile}
        />
        {displayUsedBy && <UsedBy {...usedByConfig} />}
      </Modal>
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
  validationErrors: PropTypes.object,
};

EditModalComponent.defaultProps = {
  errorMessage: null,
  recordData: null,
  FieldsComponent: null,
  isUnchanged: false,
  displayUsedBy: false,
  usedByConfig: {},
  dismissButtonText: 'Dismiss',
  cancelButtonText: 'Cancel',
  saveButtonText: 'Save',
  extraDialogProps: null,
  validationErrors: {},
};

const mapDispatchToProps = dispatch => ({
  onDismiss: () => dispatch(dismissEditor()),
});

export const EditModal = withConnectedEditor(connect(null, mapDispatchToProps)(EditModalComponent));
