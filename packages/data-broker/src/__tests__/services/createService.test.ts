/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TupaiaDataApi } from '@tupaia/data-api';
import { IndicatorApi } from '@tupaia/indicators';
import { KoBoApi } from '@tupaia/kobo-api';

import { createService } from '../../services/createService';
import { DhisService } from '../../services/dhis';
import { IndicatorService } from '../../services/indicator';
import { TupaiaService } from '../../services/tupaia';
import { KoBoService } from '../../services/kobo';
import { DataBrokerModelRegistry } from '../../types';

describe('createService()', () => {
  const database = 'db';
  const models = ({
    database,
    dataSource: {
      getTypes: () => ({}),
    },
  } as unknown) as DataBrokerModelRegistry;

  it('throws an error for invalid service type', () => {
    expect(() => createService(models, 'invalidService' as any)).toThrowError(/invalid.*type/i);
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
    const dataBroker = {
      context: {
        test: true,
      },
    };
    const service = createService(models, 'indicator', dataBroker);

    expect(service).toBeInstanceOf(IndicatorService);
    expect(service).toHaveProperty('models', models);
    expect(service).toHaveProperty('api');
    expect(service.api).toBeInstanceOf(IndicatorApi);
    expect(service.api.aggregator.context.test).toBe(true);
  });

  it('kobo service', () => {
    const service = createService(models, 'kobo');

    expect(service).toBeInstanceOf(KoBoService);
    expect(service).toHaveProperty('models', models);
    expect(service).toHaveProperty('api');
    expect(service.api).toBeInstanceOf(KoBoApi);
  });
});
