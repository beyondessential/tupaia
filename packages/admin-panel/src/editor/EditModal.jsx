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

export const EditModalComponent = withConnectedEditor(
  ({
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
    resourceName,
    isNew,
  }) => {
    const { files, handleSetFormFile } = useEditFiles(fields, onEditField);

    const FieldsComponentResolved = FieldsComponent ?? FieldsEditor;

    const buttons = [
      {
        onClick: onDismiss,
        text: error ? dismissButtonText : cancelButtonText,
        disabled: isLoading,
        variant: 'outlined',
        id: 'form-button-cancel',
      },
      {
        onClick: () => onSave(files, onDismiss),
        id: 'form-button-save',
        text: saveButtonText,
        disabled: !!error || isLoading || isUnchanged,
      },
    ];

    const generateModalTitle = () => {
      if (title) return title;
      if (!resourceName) return isNew ? 'Add' : 'Edit';
      if (error) {
        const capitalisedResourceName = `${resourceName
          .charAt(0)
          .toUpperCase()}${resourceName.slice(1)}`;
        return `${capitalisedResourceName} error`;
      }
      if (isNew) return `Add ${resourceName}`;
      return `Edit ${resourceName}`;
    };

    const modalTitle = generateModalTitle();

    return (
      <Modal
        error={error}
        isLoading={isLoading}
        onClose={onDismiss}
        isOpen={isOpen}
        disableBackdropClick
        title={modalTitle}
        buttons={buttons}
        {...extraDialogProps}
      >
        <FieldsComponentResolved
          fields={fields}
          isLoading={isLoading}
          recordData={recordData}
          onEditField={onEditField}
          onSetFormFile={handleSetFormFile}
        />
        {displayUsedBy && <UsedBy {...usedByConfig} />}
      </Modal>
    );
  },
);

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
};

const mapDispatchToProps = dispatch => ({
  onDismiss: () => dispatch(dismissEditor()),
});

export const EditModal = connect(null, mapDispatchToProps)(EditModalComponent);
