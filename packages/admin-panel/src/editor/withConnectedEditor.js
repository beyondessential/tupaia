/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { connect } from 'react-redux';
import { editField, saveEdits } from './actions';
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
  const isNew = recordData ? Object.keys(recordData).length === 0 : false;
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
    isNew,
    // optional dataToSave parameter is used in cases where only a subset of the record data is saved, e.g. saving survey questions
    onSave: (files, onSuccess, dataToSave = null) => {
      // If there is no record data, this is a new record
      let fieldValuesToSave = isNew ? { ...initialValues, ...editedFields } : { ...editedFields };
      if (dataToSave) {
        fieldValuesToSave = dataToSave;
      }
      if (onProcessDataForSave) {
        fieldValuesToSave = onProcessDataForSave(fieldValuesToSave, recordData);
      }
      dispatch(saveEdits(endpoint, fieldValuesToSave, isNew, files, onSuccess));
    },
    usedByConfig,
  };
};

export const withConnectedEditor = Component => {
  return connect(mapStateToProps, mapDispatchToProps, mergeProps)(Component);
};
