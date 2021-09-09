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
  isLoading,
  onDismiss,
  onEditField,
  onSave,
  recordData,
  title,
  fields,
  isUnchanged,
}) => {
  const fieldsBySource = keyBy(fields, 'source');

  return (
    <Dialog onClose={onDismiss} open={!!fields} disableBackdropClick>
      <DialogHeader onClose={onDismiss} title={title} />
      <ModalContentProvider errorMessage={errorMessage} isLoading={isLoading || !fields}>
        {fields && (
          <Editor
            fields={fields}
            recordData={recordData}
            onEditField={(fieldSource, newValue) => {
              const fieldSourceToEdit = getFieldSourceToEdit(fieldsBySource[fieldSource]);
              return onEditField(fieldSourceToEdit, newValue);
            }}
          />
        )}
      </ModalContentProvider>
      <DialogFooter>
        <Button variant="outlined" onClick={onDismiss} disabled={isLoading}>
          {errorMessage ? 'Dismiss' : 'Cancel'}
        </Button>
        <Button onClick={onSave} disabled={!!errorMessage || isLoading || isUnchanged}>
          Save
        </Button>
      </DialogFooter>
    </Dialog>
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
  fields: PropTypes.arrayOf(PropTypes.shape({})),
  isUnchanged: PropTypes.bool,
};

EditModalComponent.defaultProps = {
  errorMessage: null,
  title: 'Edit',
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
