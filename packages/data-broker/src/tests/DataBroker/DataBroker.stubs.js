/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import sinon from 'sinon';

import * as CreateService from '../../services/createService';
import { Service } from '../../services/Service';

export const stubCreateService = services => {
  const stub = sinon.stub(CreateService, 'createService');
  stub.callsFake((_, type) => {
    const service = services[type];
    if (!service) {
      throw new Error(`Invalid service type: ${type}`);
    }
    return service;
  });

  return stub;
};

export const createServiceStub = serviceData => {
  const pull = sinon.stub().callsFake(dataSources => {
    const dataSourceCodes = dataSources.map(({ code }) => code);
    // Service specs require that data must be pulled for a specific type each time
    const { type } = dataSources[0];
    const filteredServiceData = serviceData.filter(
      ({ code, type: currentType }) => dataSourceCodes.includes(code) && currentType === type,
    );

    switch (type) {
      case 'dataElement': {
        const data = { results: [], metadata: { dataElementCodeToName: {} } };
        filteredServiceData.forEach(({ code, name, value }) => {
          data.results.push({ value });
          data.metadata.dataElementCodeToName[code] = name;
        });
        return data;
      }
      case 'dataGroup':
        return filteredServiceData.map(({ code, value }) => ({ dataValues: { [code]: value } }));
      default:
        throw new Error(`Invalid data source type: ${type}`);
    }
  });

  return sinon.createStubInstance(Service, { pull });
};

export const createModelsStub = dataSources => ({
  dataSource: {
    findOrDefault: spec =>
      dataSources.filter(({ code, type }) => spec.code.includes(code) && spec.type === type),
    getTypes: () => ({ DATA_ELEMENT: 'dataElement', DATA_GROUP: 'dataGroup' }),
  },
});
