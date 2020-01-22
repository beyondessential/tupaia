/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import sinon from 'sinon';
import { DhisApi } from '@tupaia/dhis-api';
import { DHIS_REFERENCE } from './testData';

const IMPORT_DIAGNOSTICS = {
  counts: {
    imported: 1,
    updated: 0,
    ignored: 0,
    deleted: 0,
  },
  references: [DHIS_REFERENCE],
};
const DELETE_DIAGNOSTICS = {
  counts: {
    imported: 0,
    updated: 0,
    ignored: 0,
    deleted: 1,
  },
};

const STUBBED_METHODS = {
  postEvents: IMPORT_DIAGNOSTICS,
  deleteEvent: DELETE_DIAGNOSTICS,
};

export const resetDhisApiStubHistory = dhisApiStub =>
  Object.keys(STUBBED_METHODS).forEach(methodName => dhisApiStub[methodName].resetHistory());

export const createDhisApiStub = () => {
  return sinon.createStubInstance(DhisApi, STUBBED_METHODS);
};
