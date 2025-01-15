import sinon from 'sinon';
import { DataBroker } from '@tupaia/data-broker';
import { SERVER_NAME } from './AggregateDataPusher.fixtures';

const DEFAULT_DIAGNOSTICS = {
  wasSuccessful: true,
  counts: { imported: 0, updated: 0, deleted: 0, ignored: 0 },
  errors: [],
};
const STUBBED_METHODS = {
  push: { diagnostics: DEFAULT_DIAGNOSTICS, serverName: SERVER_NAME },
  delete: DEFAULT_DIAGNOSTICS,
  getDataSourceTypes: { DATA_ELEMENT: 'dataElement' },
};

export const resetDataBrokerStubHistory = dhisApiStub =>
  Object.keys(STUBBED_METHODS).forEach(methodName => dhisApiStub[methodName].resetHistory());

export const createDataBrokerStub = () => {
  return sinon.createStubInstance(DataBroker, STUBBED_METHODS);
};
