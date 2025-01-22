import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal } from '@tupaia/ui-components';
import { dismissEditor } from './actions';
import { UsedBy } from '../usedBy/UsedBy';
import { useEditFiles } from './useEditFiles';
import { FieldsEditor } from './FieldsEditor';
import { withConnectedEditor } from './withConnectedEditor';
import { useValidationScroll } from './useValidationScroll';

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
  validationErrors,
  resourceName,
  isNew,
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

  const getButtons = () => {
    if (error) {
      return [
        {
          onClick: onDismiss,
          text: dismissButtonText,
          disabled: isLoading,
          variant: 'contained',
          id: 'form-button-cancel',
        },
      ];
    }
    return [
      {
        onClick: onDismiss,
        text: cancelButtonText,
        disabled: isLoading,
        variant: 'outlined',
        id: 'form-button-cancel',
      },
      {
        onClick: onSaveWithTouched,
        id: 'form-button-save',
        text: saveButtonText,
        disabled: !!error || isLoading || isUnchanged,
      },
    ];
  };

  const buttons = getButtons();

  const generateModalTitle = () => {
    if (title) return title;
    if (!resourceName) return isNew ? 'Add' : 'Edit';
    if (error) {
      const capitalisedResourceName = `${resourceName.charAt(0).toUpperCase()}${resourceName.slice(
        1,
      )}`;
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
        onEditField={onEditWithTouched}
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
  validationErrors: PropTypes.object,
  resourceName: PropTypes.string,
  isNew: PropTypes.bool.isRequired,
};

EditModalComponent.defaultProps = {
  error: null,
  recordData: null,
  FieldsComponent: null,
  isUnchanged: false,
  displayUsedBy: false,
  usedByConfig: {},
  dismissButtonText: 'Close',
  cancelButtonText: 'Cancel',
  saveButtonText: 'Save',
  extraDialogProps: null,
  validationErrors: {},
  title: null,
  resourceName: null,
};

const mapDispatchToProps = dispatch => ({
  onDismiss: () => dispatch(dismissEditor()),
});

export const EditModal = withConnectedEditor(connect(null, mapDispatchToProps)(EditModalComponent));
