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

/**
 * @param {DhisResponse} response
 * @returns {DhisResponseDetails}
 */
const getResponseDetails = response => {
  // Sometimes DHIS returns the response details nested in the original response,
  // while other times the response itself contains the details
  return response.response || response;
};

/**
 * @param {boolean} isDelete
 * @returns {Diagnostics}
 */
const getDefaultDiagnostics = isDelete => {
  const counts = getZeroCounts();
  if (isDelete) {
    counts.deleted = 1;
  } else {
    counts.updated = 1;
  }

  return { counts, errors: [], wasSuccessful: true };
};

/**
 * @param {ImportSummaryResponseDetails} responseDetails
 * @returns {Diagnostics}
 */
const getImportSummaryDiagnostics = responseDetails => {
  const { importCount: counts, errors: generalErrors = [], conflicts = [] } = responseDetails;
  const conflictErrors = conflicts.map(conflictToErrorString);
  const errors = generalErrors.concat(conflictErrors);

  return {
    counts,
    errors,
    wasSuccessful: errors.length === 0,
  };
};

/**
 * @param {ImportSummariesResponseDetails} responseDetails
 * @returns {Diagnostics}
 */
const getImportSummariesDiagnostics = responseDetails => {
  const { imported, updated, deleted, ignored, importSummaries = [] } = responseDetails;
  const counts = { imported, updated, deleted, ignored };

  const errors = [];
  const references = [];
  importSummaries.forEach(({ status, description, conflicts, reference }) => {
    if (status === ERROR) {
      const errorMessage = description || conflicts.map(conflictToErrorString).join(', ');
      errors.push(errorMessage);
    }

    if (reference) {
      references.push(reference);
    }
  });

  return { counts, errors, references, wasSuccessful: errors.length === 0 && ignored === 0 };
};

/**
 * @param {ObjectReportResponse} response
 * @param {boolean} isDelete
 * @returns {Diagnostics}
 */
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

/**
 * @param {{ errors: string[] }} response
 * @returns {Diagnostics}
 */
const getDeleteDataValueDiagnostics = ({ errors = [] }) => {
  const counts = getZeroCounts();
  const wasSuccessful = errors.length === 0;
  if (wasSuccessful) {
    counts.deleted = 1;
  }

  return { counts, errors, wasSuccessful };
};

/**
 * @param {DhisResponse} response
 * @param {string} isDelete   True if this is a delete, false if it's an update
 * @returns {Diagnostics}
 */
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

/**
 * @param {DhisResponse} response
 * @returns {boolean}
 */
export const checkIsImportResponse = response => {
  const responseDetails = getResponseDetails(response);
  return Object.values(IMPORT_SUMMARY_RESPONSE_TYPES).includes(responseDetails.responseType);
};
