/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import winston from 'winston';

const IMPORT_SUMMARY = 'ImportSummary';
const IMPORT_SUMMARIES = 'ImportSummaries';
const OBJECT_REPORT = 'ObjectReport';
const DELETE = 'Delete';

export const RESPONSE_TYPES = {
  IMPORT_SUMMARIES,
  IMPORT_SUMMARY,
  OBJECT_REPORT,
  DELETE,
};

const IMPORT_SUMMARY_RESPONSE_TYPES = {
  IMPORT_SUMMARIES,
  IMPORT_SUMMARY,
};

const ERROR = 'ERROR';
const SUCCESS = 'SUCCESS';
const WARNING = 'WARNING';

export const STATUS_TYPES = {
  ERROR,
  SUCCESS,
  WARNING,
};

const conflictToErrorString = conflict => `Error pushing ${conflict.object}: ${conflict.value}`;

const getZeroCounts = () => ({
  imported: 0,
  updated: 0,
  ignored: 0,
  deleted: 0,
});

const getResponseDetails = response => {
  // Sometimes DHIS returns the response details nested in the original response,
  // while other times the response itself contains the details
  return response.response || response;
};

const getDefaultDiagnostics = isDelete => {
  const counts = getZeroCounts();
  if (isDelete) {
    counts.deleted = 1;
  } else {
    counts.updated = 1;
  }

  return { counts, errors: [], wasSuccessful: true };
};

const getImportSummaryDiagnostics = responseDetails => {
  const {
    importCount: counts,
    errors: generalErrors = [],
    conflicts = [],
    status,
    description,
  } = responseDetails;
  const conflictErrors = conflicts.map(conflictToErrorString);
  const errors =
    status === ERROR && description ? [description] : generalErrors.concat(conflictErrors);

  return {
    counts,
    errors,
    wasSuccessful: errors.length === 0,
  };
};

const getImportSummariesDiagnostics = responseDetails => {
  const { imported, updated, deleted, ignored, importSummaries = [] } = responseDetails;
  let counts = { imported, updated, deleted, ignored };

  const errors = [];
  const references = [];
  importSummaries.forEach(({ status, importCount, description, conflicts, reference }) => {
    if (status === ERROR) {
      const errorMessage = description || conflicts.map(conflictToErrorString).join(', ');
      errors.push(errorMessage);

      counts = getImportCountByReference(reference, importCount, counts);
    }

    if (reference) {
      references.push(reference);
    }
  });

  return { counts, errors, references, wasSuccessful: errors.length === 0 && ignored === 0 };
};

const getImportCountByReference = (reference, singleImportCounts, totalImportCounts) => {
  let newTotalImportCounts = totalImportCounts;
  const singleImportIgnoredCount =
    singleImportCounts && singleImportCounts.ignored ? singleImportCounts.ignored : 0;

  //If there is a reference, but 'ignored' is > 0, it means that the import was actually not ignored.
  //Transfer all the 'ignored' count to 'imported'
  if (reference && singleImportIgnoredCount) {
    newTotalImportCounts = {
      ...newTotalImportCounts,
      imported: newTotalImportCounts.imported + singleImportIgnoredCount,
      ignored:
        newTotalImportCounts.ignored - singleImportIgnoredCount >= 0
          ? newTotalImportCounts.ignored - singleImportIgnoredCount
          : 0, //should never be lower than 0 but just in case
    };
  }

  return newTotalImportCounts;
};

const getObjectReportDiagnostics = (response, isDelete) => {
  const counts = getZeroCounts();
  if (response.httpStatus === 'Created') {
    counts.imported = 1;
  } else if (isDelete) {
    counts.deleted = 1;
  } else {
    counts.updated = 1;
  }

  return { counts, errors: [], wasSuccessful: true };
};

const getDeleteDataValueDiagnostics = ({ errors = [] }) => {
  const counts = getZeroCounts();
  const wasSuccessful = errors.length === 0;
  if (wasSuccessful) {
    counts.deleted = 1;
  }

  return { counts, errors, wasSuccessful };
};

export const getDiagnosticsFromResponse = (response, isDelete) => {
  const responseDetails = getResponseDetails(response);
  const { responseType } = responseDetails;

  switch (responseType) {
    case IMPORT_SUMMARIES:
      return getImportSummariesDiagnostics(responseDetails);
    case OBJECT_REPORT:
      return getObjectReportDiagnostics(response, isDelete);
    case IMPORT_SUMMARY:
      return getImportSummaryDiagnostics(responseDetails);
    case DELETE:
      return getDeleteDataValueDiagnostics(response);
    default:
      winston.warn(`Unknown responseType: ${responseType}`);
      return getDefaultDiagnostics(isDelete);
  }
};

export function combineDiagnostics(primaryDiagnostics, ...additionalDiagnostics) {
  const allDiagnostics = [primaryDiagnostics, ...additionalDiagnostics];
  const wasSuccessful = allDiagnostics.every(d => d.wasSuccessful);
  const allErrors = allDiagnostics.reduce((acc, { errors = [] }) => [...acc, ...errors], []);
  return {
    ...primaryDiagnostics, // counts should come from the primary diagnostics
    wasSuccessful,
    errors: allErrors,
  };
}

export const checkIsImportResponse = response => {
  const responseDetails = getResponseDetails(response);
  return Object.values(IMPORT_SUMMARY_RESPONSE_TYPES).includes(responseDetails.responseType);
};
