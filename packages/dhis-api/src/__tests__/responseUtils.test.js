import winston from 'winston';

import {
  getDiagnosticsFromResponse,
  checkIsImportResponse,
  RESPONSE_TYPES,
  STATUS_TYPES,
} from '../responseUtils';

const { IMPORT_SUMMARY, IMPORT_SUMMARIES, OBJECT_REPORT } = RESPONSE_TYPES;
const { ERROR } = STATUS_TYPES;

const DHIS_REFERENCE = 'dhisReference';
const ERROR_MESSAGE = 'Test error';

const createObjectReportResponse = ({ httpStatus }) => ({
  httpStatus,
  response: { responseType: OBJECT_REPORT },
});

const createImportSummaryResponse = detailProps => {
  const responseDetails = { responseType: IMPORT_SUMMARY, ...detailProps };
  return { response: responseDetails };
};

const createImportSummariesResponse = ({ importCount, importSummaries = [] } = {}) => {
  const responseDetails = {
    responseType: IMPORT_SUMMARIES,
    importSummaries: importSummaries.map(summary => createImportSummaryResponse(summary).response),
    ...importCount,
  };

  return { response: responseDetails };
};

/**
 * @param {number} [count=1] The number of conflicts and messages to create
 * @returns {{ conflicts, messages }}
 */
const createConflictsAndMessages = (count = 1) => {
  const conflicts = [];
  for (let i = 0; i < count; i++) {
    conflicts.push({
      object: `conflictObject${i}`,
      value: `conflictValue${i}`,
    });
  }

  const conflictMessages = conflicts.map(
    conflict => `Error pushing ${conflict.object}: ${conflict.value}`,
  );

  return {
    conflicts,
    conflictMessages,
  };
};

describe('responseUtils', () => {
  beforeAll(() => {
    // Suppress logging while running the tests
    jest.spyOn(winston, 'warn').mockImplementation(() => {});
  });

  describe('getDiagnosticsFromResponse()', () => {
    describe('ObjectReport response', () => {
      it('should return diagnostics for a creating an item', () => {
        const response = createObjectReportResponse({ httpStatus: 'Created' });

        expect(getDiagnosticsFromResponse(response)).toStrictEqual({
          counts: { imported: 1, updated: 0, deleted: 0, ignored: 0 },
          errors: [],
          wasSuccessful: true,
        });
      });

      it('should return diagnostics for updating an item', () => {
        const response = createObjectReportResponse({ httpStatus: 'Ok' });

        expect(getDiagnosticsFromResponse(response)).toStrictEqual({
          counts: { imported: 0, updated: 1, deleted: 0, ignored: 0 },
          errors: [],
          wasSuccessful: true,
        });
      });

      it('should return diagnostics for deleting an item', () => {
        const response = createObjectReportResponse({ httpStatus: 'Ok' });

        expect(getDiagnosticsFromResponse(response, true)).toStrictEqual({
          counts: { imported: 0, updated: 0, deleted: 1, ignored: 0 },
          errors: [],
          wasSuccessful: true,
        });
      });
    });

    describe('ImportSummary response', () => {
      it('should return diagnostics for a creating an item', () => {
        const counts = { imported: 1, updated: 0, ignored: 0, deleted: 0 };
        const response = createImportSummaryResponse({ importCount: counts });

        expect(getDiagnosticsFromResponse(response)).toStrictEqual({
          counts,
          errors: [],
          wasSuccessful: true,
        });
      });

      it('should return diagnostics for updating an item', () => {
        const counts = { imported: 0, updated: 1, ignored: 0, deleted: 0 };
        const response = createImportSummaryResponse({ importCount: counts });

        expect(getDiagnosticsFromResponse(response)).toStrictEqual({
          counts,
          errors: [],
          wasSuccessful: true,
        });
      });

      it('should accept both response and response details inputs', () => {
        const counts = { imported: 1, updated: 0, ignored: 0, deleted: 0 };
        const response = createImportSummaryResponse({ importCount: counts });

        const responseDiagnostics = getDiagnosticsFromResponse(response);
        const responseDetailsDiagnostics = getDiagnosticsFromResponse(response.response);
        expect(responseDiagnostics).toStrictEqual(responseDetailsDiagnostics);
      });

      it('should return diagnostics for deleting an item', () => {
        const counts = { imported: 0, updated: 0, ignored: 0, deleted: 1 };
        const response = createImportSummaryResponse({ importCount: counts });

        expect(getDiagnosticsFromResponse(response)).toStrictEqual({
          counts,
          errors: [],
          wasSuccessful: true,
        });
      });

      it('should return diagnostics for an error', () => {
        const counts = { imported: 0, updated: 0, ignored: 0, deleted: 0 };
        const errors = ['Test error'];
        const response = createImportSummaryResponse({ importCount: counts, errors });

        expect(getDiagnosticsFromResponse(response)).toStrictEqual({
          counts,
          errors,
          wasSuccessful: false,
        });
      });

      it('should return diagnostics for a conflict', () => {
        const counts = { imported: 0, updated: 0, ignored: 1, deleted: 0 };
        const { conflicts, conflictMessages } = createConflictsAndMessages();
        const response = createImportSummaryResponse({
          importCount: counts,
          conflicts: [conflicts[0]],
        });

        expect(getDiagnosticsFromResponse(response)).toStrictEqual({
          counts,
          errors: [conflictMessages[0]],
          wasSuccessful: false,
        });
      });
    });

    describe('ImportSummaries response', () => {
      it('should return diagnostics for a creating a single item', () => {
        const counts = { imported: 1, updated: 0, ignored: 0, deleted: 0 };
        const response = createImportSummariesResponse({
          importCount: counts,
          importSummaries: [{ counts, reference: DHIS_REFERENCE }],
        });

        expect(getDiagnosticsFromResponse(response)).toStrictEqual({
          counts,
          errors: [],
          wasSuccessful: true,
          references: [DHIS_REFERENCE],
        });
      });

      it('should accept both response and response details inputs', () => {
        const counts = { imported: 1, updated: 0, ignored: 0, deleted: 0 };
        const response = createImportSummariesResponse({
          importCount: counts,
          importSummaries: [{ counts, reference: DHIS_REFERENCE }],
        });

        const responseDiagnostics = getDiagnosticsFromResponse(response);
        const responseDetailsDiagnostics = getDiagnosticsFromResponse(response.response);
        expect(responseDiagnostics).toStrictEqual(responseDetailsDiagnostics);
      });

      it('should return diagnostics for creating multiple items', () => {
        const countsForSingleItem = { imported: 1, updated: 0, ignored: 0, deleted: 0 };
        const countsTotal = { imported: 2, updated: 0, ignored: 0, deleted: 0 };
        const dhisReference2 = 'newDhisReference';
        const response = createImportSummariesResponse({
          importCount: countsTotal,
          importSummaries: [
            { counts: countsForSingleItem, reference: DHIS_REFERENCE },
            { counts: countsForSingleItem, reference: dhisReference2 },
          ],
        });

        expect(getDiagnosticsFromResponse(response)).toStrictEqual({
          counts: countsTotal,
          errors: [],
          wasSuccessful: true,
          references: [DHIS_REFERENCE, dhisReference2],
        });
      });

      it('should return diagnostics for a single error', () => {
        const counts = { imported: 0, updated: 0, ignored: 1, deleted: 0 };
        const response = createImportSummariesResponse({
          importCount: counts,
          importSummaries: [{ counts, status: ERROR, description: ERROR_MESSAGE }],
        });

        expect(getDiagnosticsFromResponse(response)).toStrictEqual({
          counts,
          errors: [ERROR_MESSAGE],
          wasSuccessful: false,
          references: [],
        });
      });

      it('should return diagnostics for multiple errors', () => {
        const countsForSingleItem = { imported: 0, updated: 0, ignored: 1, deleted: 0 };
        const countsTotal = { imported: 0, updated: 0, ignored: 2, deleted: 0 };
        const errorMessage2 = 'New error message';
        const response = createImportSummariesResponse({
          importCount: countsTotal,
          importSummaries: [
            { counts: countsForSingleItem, status: ERROR, description: ERROR_MESSAGE },
            { counts: countsForSingleItem, status: ERROR, description: errorMessage2 },
          ],
        });

        expect(getDiagnosticsFromResponse(response)).toStrictEqual({
          counts: countsTotal,
          errors: [ERROR_MESSAGE, errorMessage2],
          wasSuccessful: false,
          references: [],
        });
      });

      it('should return diagnostics for a single conflict', () => {
        const counts = { imported: 0, updated: 0, ignored: 1, deleted: 0 };
        const { conflicts, conflictMessages } = createConflictsAndMessages();
        const response = createImportSummariesResponse({
          importCount: counts,
          importSummaries: [{ counts, status: ERROR, conflicts: [conflicts[0]] }],
        });

        expect(getDiagnosticsFromResponse(response)).toStrictEqual({
          counts,
          errors: [conflictMessages[0]],
          wasSuccessful: false,
          references: [],
        });
      });

      it('should return diagnostics for multiple conflicts', () => {
        const countsForSingleItem = { imported: 0, updated: 0, ignored: 1, deleted: 0 };
        const countsTotal = { imported: 0, updated: 0, ignored: 2, deleted: 0 };
        const { conflicts, conflictMessages } = createConflictsAndMessages(3);

        const response = createImportSummariesResponse({
          importCount: countsTotal,
          importSummaries: [
            { counts: countsForSingleItem, status: ERROR, conflicts: [conflicts[0]] },
            { counts: countsForSingleItem, status: ERROR, conflicts: [conflicts[1], conflicts[2]] },
          ],
        });

        expect(getDiagnosticsFromResponse(response)).toStrictEqual({
          counts: countsTotal,
          errors: [conflictMessages[0], `${conflictMessages[1]}, ${conflictMessages[2]}`],
          wasSuccessful: false,
          references: [],
        });
      });
    });

    describe('Unknown response type', () => {
      const response = { response: { responseType: 'Random type' } };

      it('should return diagnostics for an update change', () => {
        expect(getDiagnosticsFromResponse(response)).toStrictEqual({
          counts: { imported: 0, updated: 1, ignored: 0, deleted: 0 },
          errors: [],
          wasSuccessful: true,
        });
      });

      it('should return diagnostics for a delete change', () => {
        expect(getDiagnosticsFromResponse(response, true)).toStrictEqual({
          counts: { imported: 0, updated: 0, ignored: 0, deleted: 1 },
          errors: [],
          wasSuccessful: true,
        });
      });
    });
  });

  describe('checkIsImportResponse()', () => {
    it('should return true for an Import Summaries response', () => {
      const response = createImportSummariesResponse();
      expect(checkIsImportResponse(response)).toBe(true);
    });

    it('should return true for an Import Summary response', () => {
      const response = createImportSummaryResponse();
      expect(checkIsImportResponse(response)).toBe(true);
    });

    it('should accept both response and response details inputs', () => {
      const response = createImportSummariesResponse();

      const responseResult = checkIsImportResponse(response);
      const responseDetailsResult = checkIsImportResponse(response.response);
      expect(responseResult).toStrictEqual(responseDetailsResult);
    });

    it('should return false for other response types', () => {
      const response = { response: { responseType: 'randomType' } };
      expect(checkIsImportResponse(response)).toBe(false);
    });
  });
});
