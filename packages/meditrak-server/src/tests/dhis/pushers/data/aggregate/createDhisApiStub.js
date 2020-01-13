/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import sinon from 'sinon';
import { DhisApi, RESPONSE_TYPES } from '@tupaia/dhis-api';
import { ORGANISATION_UNIT_ID } from './testData';

// taken directly from a DHIS2 api call, with redundant info stripped out
const IMPORT_SUMMARY = {
  responseType: RESPONSE_TYPES.IMPORT_SUMMARY,
  importCount: {
    imported: 1,
    updated: 0,
    ignored: 0,
    deleted: 0,
  },
};

const DELETE_SUMMARY = {
  responseType: RESPONSE_TYPES.DELETE,
};

const STUBBED_METHODS = {
  postDataValueSet: IMPORT_SUMMARY,
  postDataSetCompletion: IMPORT_SUMMARY,
  deleteDataValue: DELETE_SUMMARY,
  deleteDataSetCompletion: DELETE_SUMMARY,
  getDataSetByCode: null,
  getIdFromCode: ORGANISATION_UNIT_ID,
};

export const resetDhisApiStubHistory = dhisApiStub =>
  Object.keys(STUBBED_METHODS).forEach(methodName => dhisApiStub[methodName].resetHistory());

export const createDhisApiStub = () => {
  return sinon.createStubInstance(DhisApi, STUBBED_METHODS);
};
