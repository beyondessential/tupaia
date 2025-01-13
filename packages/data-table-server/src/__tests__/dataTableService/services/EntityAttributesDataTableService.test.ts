import { createModelsStub } from '@tupaia/database';
import { DataTableServiceBuilder } from '../../../dataTableService';
import { ENTITIES } from './fixtures';
import { DataTableServerModelRegistry } from '../../../types';

const modelsStub = createModelsStub({
  entity: { records: ENTITIES },
}) as DataTableServerModelRegistry;

const service = new DataTableServiceBuilder()
  .setServiceType('entity_attributes')
  .setContext({
    models: modelsStub,
  })
  .build();

describe('EntityAttributesDataTableService', () => {
  describe('parameter validation', () => {
    const testData: [string, unknown, string][] = [
      ['missing entityCodes', {}, 'entityCodes is a required field'],
    ];

    it.each(testData)('%s', (_, parameters: unknown, expectedError: string) => {
      expect(() => service.fetchData(parameters)).toThrow(expectedError);
    });
  });

  it('getParameters', () => {
    const parameters = service.getParameters();
    expect(parameters).toEqual([
      {
        name: 'entityCodes',
        config: {
          type: 'organisationUnitCodes',
          innerType: { type: 'string', required: true },
          required: true,
        },
      },
      {
        name: 'attributes',
        config: {
          type: 'array',
          innerType: { type: 'string', required: true },
          defaultValue: [],
        },
      },
    ]);
  });

  describe('fetchData', () => {
    it('can fetch entity attributes', async () => {
      const result = await service.fetchData({
        entityCodes: ['VU_Facility1', 'VU_Facility2'],
        attributes: ['x', 'y'],
      });

      expect(result).toEqual([
        {
          entityCode: 'VU_Facility1',
          x: 5,
          y: 'hello',
        },
        {
          entityCode: 'VU_Facility2',
          x: 6,
        },
      ]);
    });

    it('returns all attributes if none specified', async () => {
      const result = await service.fetchData({
        entityCodes: ['VU_Facility1'],
      });

      expect(result).toEqual([
        {
          entityCode: 'VU_Facility1',
          x: 5,
          y: 'hello',
          z: {},
        },
      ]);
    });
  });
});
