import sinon from 'sinon';
import { DhisApi } from '@tupaia/dhis-api';
import { ORGANISATION_UNIT_ID } from './AggregateDataPusher.fixtures';

// taken directly from a DHIS2 api call, with redundant info stripped out
const SUCCESS_DIAGNOSTICS = {
  wasSuccessful: true,
};

const STUBBED_METHODS = {
  postDataSetCompletion: SUCCESS_DIAGNOSTICS,
  deleteDataSetCompletion: SUCCESS_DIAGNOSTICS,
  getDataSetByCode: null,
  getIdFromCode: ORGANISATION_UNIT_ID,
};

export const resetDhisApiStubHistory = dhisApiStub =>
  Object.keys(STUBBED_METHODS).forEach(methodName => dhisApiStub[methodName].resetHistory());

export const createDhisApiStub = () => {
  return sinon.createStubInstance(DhisApi, STUBBED_METHODS);
};
