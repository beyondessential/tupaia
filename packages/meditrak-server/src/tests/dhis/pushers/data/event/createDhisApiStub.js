/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import sinon from 'sinon';
import { DhisApi } from '../../../../../dhis/api/DhisApi';
import { RESPONSE_TYPES } from '../../../../../dhis/responseUtils';
import { DHIS_REFERENCE } from './testData';

const IMPORT_SUMMARY = {
  responseType: RESPONSE_TYPES.IMPORT_SUMMARIES,
  imported: 1,
  updated: 0,
  ignored: 0,
  deleted: 0,
  importSummaries: [
    {
      reference: DHIS_REFERENCE,
    },
  ],
};
const DELETE_SUMMARY = {
  responseType: RESPONSE_TYPES.IMPORT_SUMMARY,
  importCount: {
    imported: 0,
    updated: 0,
    ignored: 0,
    deleted: 1,
  },
};

const STUBBED_METHODS = {
  postEvent: IMPORT_SUMMARY,
  deleteEvent: DELETE_SUMMARY,
};

export const resetDhisApiStubHistory = dhisApiStub =>
  Object.keys(STUBBED_METHODS).forEach(methodName => dhisApiStub[methodName].resetHistory());

export const createDhisApiStub = () => {
  return sinon.createStubInstance(DhisApi, STUBBED_METHODS);
};
