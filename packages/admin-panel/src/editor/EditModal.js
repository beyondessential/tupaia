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
  isLoading,
  onDismiss,
  onEditField,
  onSave,
  recordData,
  title,
  fields,
  isUnchanged,
  displayUsedBy,
  usedBy,
  usedByIsLoading,
  usedByErrorMessage,
  endpoint,
}) => {
  const fieldsBySource = keyBy(fields, 'source');

  const getTitle = () => {
    if (endpoint !== null && Array.isArray(title)) {
      const { titleText: selectedTitle } = title
        .filter(config => endpoint.includes(config.titleEndpoint))
        .shift();
      return selectedTitle;
    }
    if (endpoint === null) {
      return 'Edit';
    }
    return title;
  };

  return (
    <Dialog onClose={onDismiss} open={!!fields} disableBackdropClick>
      <DialogHeader onClose={onDismiss} title={getTitle()} />
      <ModalContentProvider errorMessage={errorMessage} isLoading={isLoading || !fields}>
        <>
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
          {displayUsedBy && (
            <UsedBy usedBy={usedBy} isLoading={usedByIsLoading} errorMessage={usedByErrorMessage} />
          )}
        </>
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
  recordData: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  fields: PropTypes.arrayOf(PropTypes.shape({})),
  isUnchanged: PropTypes.bool,
  displayUsedBy: PropTypes.bool,
  usedBy: PropTypes.array,
  usedByIsLoading: PropTypes.bool,
  usedByErrorMessage: PropTypes.string,
  endpoint: PropTypes.string,
};

EditModalComponent.defaultProps = {
  errorMessage: null,
  title: 'Edit',
  recordData: null,
  fields: null,
  isUnchanged: false,
  displayUsedBy: false,
  usedBy: null,
  usedByIsLoading: null,
  usedByErrorMessage: null,
  endpoint: null,
};

const mapStateToProps = state => ({
  ...getEditorState(state),
  isUnchanged: getIsUnchanged(state),
  usedBy: state.usedBy.byRecordId[state.editor.recordId] ?? [],
  usedByIsLoading: state.usedBy.isLoading,
  usedByErrorMessage: state.usedBy.errorMessage,
});

const mapDispatchToProps = dispatch => ({
  onDismiss: () => dispatch(closeEditModal()),
  onEditField: (fieldKey, newValue) => dispatch(editField(fieldKey, newValue)),
  dispatch,
});

const processRecordData = (recordData, fields) => {
  if (Array.isArray(recordData)) {
    const [firstRecord] = recordData;
    return fields.reduce((obj, field) => {
      const value = field.bulkAccessor ? field.bulkAccessor(recordData) : firstRecord[field.source];
      return { [field.source]: value, ...obj };
    }, {});
  }

  return recordData;
};

const mergeProps = (
  { endpoint, editedFields, recordData, ...stateProps },
  { dispatch, ...dispatchProps },
  { onProcessDataForSave, ...ownProps },
) => {
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
  };
};

export const EditModal = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(EditModalComponent);
