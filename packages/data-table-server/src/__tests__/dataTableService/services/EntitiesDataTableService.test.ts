import { MockTupaiaApiClient, MockEntityApi } from '@tupaia/api-client';
import { DataTableServiceBuilder } from '../../../dataTableService';
import { ENTITIES, ENTITY_RELATIONS } from './fixtures';

const entitiesDataTableService = new DataTableServiceBuilder()
  .setServiceType('entities')
  .setContext({
    apiClient: new MockTupaiaApiClient({ entity: new MockEntityApi(ENTITIES, ENTITY_RELATIONS) }),
  })
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
      { config: { defaultValue: 'explore', type: 'hierarchy' }, name: 'hierarchy' },
      {
        config: {
          innerType: { required: true, type: 'string' },
          required: true,
          type: 'organisationUnitCodes',
        },
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
    it('can fetch entities', async () => {
      const entities = await entitiesDataTableService.fetchData({
        entityCodes: ['AU', 'AU_Facility1', 'FJ'],
        fields: ['name', 'type'],
      });

      expect(entities).toEqual([
        {
          name: 'Australia',
          type: 'country',
        },
        {
          name: 'Fiji',
          type: 'country',
        },
        {
          name: 'Australian Facility 1',
          type: 'facility',
        },
      ]);
    });

    it('can fetch entities and descendants', async () => {
      const entities = await entitiesDataTableService.fetchData({
        hierarchy: 'test',
        entityCodes: ['PG'],
        fields: ['name', 'type'],
        includeDescendants: true,
      });

      expect(entities).toEqual([
        {
          name: 'PNG',
          type: 'country',
        },
        {
          name: 'PNG Facility',
          type: 'facility',
        },
      ]);
    });
  });
});
