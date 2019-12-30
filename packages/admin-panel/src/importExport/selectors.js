/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

export const getErrorMessage = state => {
  const { importExport } = state;
  return importExport.errorMessage;
};
export const getIsProcessing = ({ importExport }) => importExport.isLoading;
export const getImportRecordType = ({ importExport }) => importExport.importEndpoint;
export const getIsPreparingImport = state => !!getImportRecordType(state);
