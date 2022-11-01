/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { TupaiaApiClient } from '@tupaia/api-client';
import { DataTableServiceBuilder } from '../../../dataTableService';

const entitiesDataTableService = new DataTableServiceBuilder()
  .setServiceType('entities')
  .setContext({ apiClient: {} as TupaiaApiClient })
  .build();

describe('EntitiesDataTableService', () => {
  describe('parameter validation', () => {
    const testData: [string, unknown, string][] = [
      ['missing entityCodes', {}, 'entityCodes is a required field'],
    ];

    it.each(testData)('%s', (_, parameters: unknown, expectedError: string) => {
      expect(() => entitiesDataTableService.fetchData(parameters)).toThrow(expectedError);
    });
  });

  it('getParameters', () => {
    const parameters = entitiesDataTableService.getParameters();
    expect(parameters).toEqual([
      { config: { defaultValue: 'explore', type: 'string' }, name: 'hierarchy' },
      {
        config: { innerType: { required: true, type: 'string' }, required: true, type: 'array' },
        name: 'entityCodes',
      },
      {
        config: { type: 'object' },
        name: 'filter',
      },
      {
        config: {
          defaultValue: ['code'],
          type: 'array',
          innerType: { type: 'string', required: true },
        },
        name: 'fields',
      },
      { config: { defaultValue: false, type: 'boolean' }, name: 'includeDescendants' },
    ]);
  });

  describe('fetchData', () => {
    // TODO: Implement these tests when RN-685 is done
    // it('can fetch entities', async () => {});
    // it('can fetch entities and descendants', async () => {});
  });
});
