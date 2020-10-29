/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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
    expect(() => createService(models, 'invalidService')).toThrowError(/invalid.*type/i);
  });

  it('dhis service', () => {
    const service = createService(models, 'dhis');

    expect(service).toBeInstanceOf(DhisService);
    expect(service).toHaveProperty('models', models);
  });

  it('tupaia service', () => {
    const service = createService(models, 'tupaia');

    expect(service).toBeInstanceOf(TupaiaService);
    expect(service).toHaveProperty('models', models);
    expect(service).toHaveProperty('api');
    expect(service.api).toBeInstanceOf(TupaiaDataApi);
  });

  it('indicator service', () => {
    const service = createService(models, 'indicator');

    expect(service).toBeInstanceOf(IndicatorService);
    expect(service).toHaveProperty('models', models);
    expect(service).toHaveProperty('api');
    expect(service.api).toBeInstanceOf(IndicatorApi);
  });
});
