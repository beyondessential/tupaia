import { fetchOrgUnitsByCountry } from '../../DataBroker/fetchOrgUnitsByCountry';
import { DataBrokerModelRegistry } from '../../types';

const createModels = (rows: { code: string; country_code: string }[]) =>
  ({
    entity: {
      find: async () => rows,
    },
  }) as unknown as DataBrokerModelRegistry;

describe('fetchOrgUnitsByCountry', () => {
  it('groups org unit codes by country', async () => {
    const models = createModels([
      { code: 'TO_village_1', country_code: 'TO' },
      { code: 'TO_village_2', country_code: 'TO' },
      { code: 'PG_village_1', country_code: 'PG' },
    ]);

    const result = await fetchOrgUnitsByCountry(models, [
      'TO_village_1',
      'TO_village_2',
      'PG_village_1',
    ]);

    expect(result).toEqual({
      TO: ['TO_village_1', 'TO_village_2'],
      PG: ['PG_village_1'],
    });
  });

  it('de-duplicates codes that match multiple project-scoped entity rows', async () => {
    const models = createModels([
      { code: 'TO_village_1', country_code: 'TO' }, // fanafana copy
      { code: 'TO_village_1', country_code: 'TO' }, // ehealth copy
      { code: 'TO_village_1', country_code: 'TO' }, // another project copy
      { code: 'TO_village_2', country_code: 'TO' },
    ]);

    const result = await fetchOrgUnitsByCountry(models, ['TO_village_1', 'TO_village_2']);

    expect(result).toEqual({ TO: ['TO_village_1', 'TO_village_2'] });
  });
});
