/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import {
  IMPORT_EXPORT_START,
  IMPORT_EXPORT_ERROR,
  IMPORT_EXPORT_SUCCESS,
  IMPORT_DIALOG_OPEN,
  IMPORT_EXPORT_DISMISS,
} from './constants';

export const openImportDialog = ({ importEndpoint }) => ({
    type: IMPORT_DIALOG_OPEN,
    importEndpoint,
});

export const openFilteredExportDialog = (actionConfig, recordId, row) => async (
  dispatch,
  getState,
  { api },
) => {
  console.log('openFilteredExportDialog');
  console.log('ACTION CONFIG', actionConfig);
  console.log('ROW', row);

  const response = await api.get(`${actionConfig.filterEndpoint}`, {
    columns: JSON.stringify(['name', 'code']),
    filter: JSON.stringify({
      code: { comparator: 'LIKE', comparisonValue: `${row.code}%`, ignoreCase: true },
    }),
  });

  console.log('RESPONSE', response);

  /*
  @TODO

  use dispatch to call the modal with the response data.
  the modal should list the names and code for the user
  to pick which ones will be used to filter in the export
  after the selection, call the existing exportData
  */
};

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

export const exportData = ({ exportEndpoint, queryParameter, fileName }, id, rowData) => async (
  dispatch,
  getState,
  { api },
) => {
  dispatch({
    type: IMPORT_EXPORT_START,
  });
  const endpoint = `export/${exportEndpoint}${!queryParameter && id ? `/${id}` : ''}`;
  const processedFileName = processFileName(fileName, rowData);
  try {
    await api.download(endpoint, queryParameter ? { [queryParameter]: id } : {}, processedFileName);
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
  const segmentsToSubstitute = unprocessedFileName.match(/(\{[^}]*\})/g) || [];
  let fileName = unprocessedFileName;
  for (let i = 0; i < segmentsToSubstitute.length; i++) {
    const segment = segmentsToSubstitute[i];
    fileName = fileName.replace(segment, rowData[segment.substring(1, segment.length - 1)]);
  }
  return `${fileName}.xlsx`;
};

export const dismissDialog = () => ({
  type: IMPORT_EXPORT_DISMISS,
});
