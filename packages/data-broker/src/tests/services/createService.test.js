/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { createService, TYPE_TO_SERVICE } from '../../services/createService';

describe('createService()', () => {
  const models = {
    dataSource: {
      getTypes: () => ({}),
    },
  };

  Object.entries(TYPE_TO_SERVICE).forEach(([serviceType, serviceClass]) => {
    it(`${serviceType} service`, () => {
      const service = createService(models, serviceType);

      expect(service).to.be.instanceOf(serviceClass);
      expect(service).to.have.deep.property('models', models);
    });
  });
});
