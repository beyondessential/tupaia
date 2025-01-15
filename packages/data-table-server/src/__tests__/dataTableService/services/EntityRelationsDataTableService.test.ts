import { MockTupaiaApiClient, MockEntityApi } from '@tupaia/api-client';
import { DataTableServiceBuilder } from '../../../dataTableService';
import { ENTITIES, ENTITY_RELATIONS } from './fixtures';

const entityRelationsDataTableService = new DataTableServiceBuilder()
  .setServiceType('entity_relations')
  .setContext({
    apiClient: new MockTupaiaApiClient({ entity: new MockEntityApi(ENTITIES, ENTITY_RELATIONS) }),
  })
  .build();

describe('EntityRelationsDataTableService', () => {
  describe('parameter validation', () => {
    const testData: [string, unknown, string][] = [
      [
        'missing entityCodes',
        { ancestorType: 'district', descendantType: 'sub_district' },
        'entityCodes is a required field',
      ],
      [
        'missing descendantType',
        { entityCodes: ['TO'], ancestorType: 'district' },
        'descendantType is a required field',
      ],
    ];

    it.each(testData)('%s', (_, parameters: unknown, expectedError: string) => {
      expect(() => entityRelationsDataTableService.fetchData(parameters)).toThrow(expectedError);
    });
  });

  it('getParameters', () => {
    const parameters = entityRelationsDataTableService.getParameters();
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
      { config: { type: 'string' }, name: 'ancestorType' },
      { config: { type: 'string', required: true }, name: 'descendantType' },
    ]);
  });

  describe('fetchData', () => {
    it('can fetch relations between entities', async () => {
      const relations = await entityRelationsDataTableService.fetchData({
        entityCodes: ['AU', 'FJ'],
        ancestorType: 'country',
        descendantType: 'facility',
      });
      expect(relations).toEqual([
        { ancestor: 'AU', descendant: 'AU_Facility1' },
        { ancestor: 'AU', descendant: 'AU_Facility2' },
        { ancestor: 'FJ', descendant: 'FJ_Facility' },
      ]);
    });

    it('can fetch relations between entities for a given hierarchy', async () => {
      const relations = await entityRelationsDataTableService.fetchData({
        hierarchy: 'test',
        entityCodes: ['PG'],
        ancestorType: 'country',
        descendantType: 'facility',
      });
      expect(relations).toEqual([{ ancestor: 'PG', descendant: 'PG_Facility' }]);
    });
  });
});
