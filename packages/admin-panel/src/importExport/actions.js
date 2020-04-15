/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import {
  IMPORT_EXPORT_START,
  IMPORT_EXPORT_ERROR,
  IMPORT_EXPORT_SUCCESS,
  IMPORT_EXPORT_DISMISS,
  IMPORT_DIALOG_OPEN,
  EXPORT_DIALOG_OPEN,
} from './constants';
import { makeSubstitutionsInString } from '../utilities';

export const openFilteredExportDialog = parentRecord => ({
  type: EXPORT_DIALOG_OPEN,
  parentRecord,
});

export const openImportDialog = () => ({
  type: IMPORT_DIALOG_OPEN,
});

export const importData = (recordType, file, queryParameters) => async (
  dispatch,
  getState,
  { api },
) => {
  dispatch({
    type: IMPORT_EXPORT_START,
  });
  const endpoint = `import/${recordType}`;
  try {
    await api.upload(endpoint, recordType, file, queryParameters);
    dispatch({
      type: IMPORT_EXPORT_SUCCESS,
    });
  } catch (error) {
    dispatch({
      type: IMPORT_EXPORT_ERROR,
      errorMessage: error.message,
    });
  }
};

const buildExportQueryParameters = (rowIdQueryParameter, rowData, filterQueryParameters) => {
  if (!rowIdQueryParameter && !filterQueryParameters) return null;
  const queryParameters = rowIdQueryParameter ? { [rowIdQueryParameter]: rowData.id } : {};
  if (filterQueryParameters) {
    return { ...queryParameters, ...filterQueryParameters };
  }
  return queryParameters;
};

export const exportData = (
  { exportEndpoint, rowIdQueryParameter, fileName },
  rowData,
  filterQueryParameters,
) => async (dispatch, getState, { api }) => {
  dispatch({
    type: IMPORT_EXPORT_START,
  });
  const queryParameters = buildExportQueryParameters(
    rowIdQueryParameter,
    rowData,
    filterQueryParameters,
  );
  const endpoint = `export/${exportEndpoint}${
    !queryParameters && rowData.id ? `/${rowData.id}` : ''
  }`;
  const processedFileName = processFileName(fileName, rowData);
  try {
    await api.download(endpoint, queryParameters, processedFileName);
    dispatch({
      type: IMPORT_EXPORT_SUCCESS,
    });
  } catch (error) {
    dispatch({
      type: IMPORT_EXPORT_ERROR,
      errorMessage: error.message,
    });
  }
};

const processFileName = (unprocessedFileName, rowData) => {
  const fileName = makeSubstitutionsInString(unprocessedFileName, rowData);
  return `${fileName}.xlsx`;
};

export const dismissDialog = () => ({
  type: IMPORT_EXPORT_DISMISS,
});
