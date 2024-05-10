/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { connect } from 'react-redux';
import { editField, loadEditor, saveEdits } from './actions';
import { getEditorState, getIsUnchanged } from './selectors';

const mapStateToProps = state => {
  return {
    ...getEditorState(state),
    isUnchanged: getIsUnchanged(state),
    usedByConfig: {
      usedBy: state.usedBy.byRecordId[state.editor.recordId] ?? [],
      usedByIsLoading: state.usedBy.isLoading,
      usedByErrorMessage: state.usedBy.errorMessage,
    },
  };
};

const mapDispatchToProps = dispatch => ({
  onEditField: (fieldKey, newValue) => dispatch(editField(fieldKey, newValue)),
  loadEditor: (config, recordId) => dispatch(loadEditor(config, recordId)),
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

export const withConnectedEditor = Component => {
  return connect(mapStateToProps, mapDispatchToProps, mergeProps)(Component);
};
