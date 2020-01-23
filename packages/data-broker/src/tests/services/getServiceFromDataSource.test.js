/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { getServiceFromDataSource, TYPE_TO_SERVICE } from '../../services/getServiceFromDataSource';

describe('getServiceFromDataSource()', () => {
  const models = { DataSource: { types: {} } };

  Object.entries(TYPE_TO_SERVICE).forEach(([serviceType, serviceClass]) => {
    const dataSource = { code: 'POP01', service_type: serviceType };

    it(`${serviceType} service`, () => {
      const service = getServiceFromDataSource(dataSource, models);

      expect(service).to.be.instanceOf(serviceClass);
      expect(service).to.have.deep.property('dataSource', dataSource);
      expect(service).to.have.deep.property('models', models);
    });
  });
});
