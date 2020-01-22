/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import sinon from 'sinon';
import { DhisApi } from '@tupaia/dhis-api';
import { ORGANISATION_UNIT_ID } from './testData';

// taken directly from a DHIS2 api call, with redundant info stripped out
const IMPORT_DIAGNOSTICS = {
  counts: {
    imported: 1,
    updated: 0,
    ignored: 0,
    deleted: 0,
  },
};

const DELETE_DIAGNOSTICS = {};

const STUBBED_METHODS = {
  postDataValueSets: IMPORT_DIAGNOSTICS,
  postDataSetCompletion: IMPORT_DIAGNOSTICS,
  deleteDataValue: DELETE_DIAGNOSTICS,
  deleteDataSetCompletion: DELETE_DIAGNOSTICS,
  getDataSetByCode: null,
  getIdFromCode: ORGANISATION_UNIT_ID,
};

export const resetDhisApiStubHistory = dhisApiStub =>
  Object.keys(STUBBED_METHODS).forEach(methodName => dhisApiStub[methodName].resetHistory());

export const createDhisApiStub = () => {
  return sinon.createStubInstance(DhisApi, STUBBED_METHODS);
};
