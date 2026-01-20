import { createModelsStub } from '../../server/testUtilities';

describe('createModelsStub', () => {
  const mockModels = createModelsStub({
    horses: {
      records: [
        {
          name: 'Rufio',
          color: 'blue',
          config: {
            mane: 'luxurious',
            group: {
              name: 'A',
            },
          },
        },
        {
          name: 'Billy',
          color: 'blue',
          config: {
            mane: 'enchanting',
            group: {
              name: 'B',
            },
          },
        },
        {
          name: 'Zane',
          color: 'purple',
          config: {},
        },
      ],
    },
  });

  it('can find()', async () => {
    const results = await mockModels.horses.find({ color: 'purple' });
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Zane');
  });

  it('can findOne()', async () => {
    const result = await mockModels.horses.findOne({ color: 'blue' });
    expect(result.name).toBe('Rufio'); // first in order
  });

  it('supports array value', async () => {
    const results = await mockModels.horses.find({ name: ['Rufio', 'Billy'] });
    expect(results.length).toBe(2);
  });

  it('supports ->> keys', async () => {
    const results = await mockModels.horses.find({ 'config->>mane': 'enchanting' });
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Billy');
  });

  it('supports ->> keys as array', async () => {
    const results = await mockModels.horses.find({ 'config->>mane': ['enchanting', 'luxurious'] });
    expect(results.length).toBe(2);
  });

  it('supports multi depth ->> keys', async () => {
    const results = await mockModels.horses.find({ 'config->group->>name': 'A' });
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Rufio');
  });
});
