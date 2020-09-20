/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { TupaiaDataApi } from '@tupaia/data-api';
import { IndicatorApi } from '@tupaia/indicators';

import { createService } from '../../services/createService';
import { DhisService } from '../../services/dhis';
import { IndicatorService } from '../../services/indicator';
import { TupaiaService } from '../../services/tupaia';

describe('createService()', () => {
  const database = 'db';
  const models = {
    database,
    dataSource: {
      getTypes: () => ({}),
    },
  };

  it('throws an error for invalid service type', () => {
    expect(() => createService(models, 'invalidService')).to.throw(/invalid.*type/i);
  });

  it('dhis service', () => {
    const service = createService(models, 'dhis');

    expect(service).to.be.instanceOf(DhisService);
    expect(service).to.have.deep.property('models', models);
  });

  it('tupaia service', () => {
    const service = createService(models, 'tupaia');

    expect(service).to.be.instanceOf(TupaiaService);
    expect(service).to.have.deep.property('models', models);
    expect(service).to.have.deep.property('api');
    expect(service.api).to.be.instanceOf(TupaiaDataApi);
  });

  it('indicator service', () => {
    const service = createService(models, 'indicator');

    expect(service).to.be.instanceOf(IndicatorService);
    expect(service).to.have.deep.property('models', models);
    expect(service).to.have.deep.property('api');
    expect(service.api).to.be.instanceOf(IndicatorApi);
  });
});
