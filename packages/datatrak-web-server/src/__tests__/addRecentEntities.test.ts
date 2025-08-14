import { addRecentEntities } from '../utils';

const NUM_MOCK_ENTITIES = 10;
const mockEntities = [...Array(NUM_MOCK_ENTITIES).keys()].flatMap(x => [
  {
    id: `DL_${x}`,
    country_code: 'DL',
    type: x > NUM_MOCK_ENTITIES / 2 ? 'facility' : 'district',
  },
  {
    id: `FJ_${x}`,
    country_code: 'FJ',
    type: x > NUM_MOCK_ENTITIES / 2 ? 'facility' : 'district',
  },
]);
const mockUser = {
  preferences: {},
};

const mockModels = {
  user: {
    findById: (_id: string) => mockUser,
    updateById: (_id: string, update: any) => {
      mockUser.preferences = update.preferences;
    },
  },
  entity: {
    findById: (id: string) => mockEntities.find(x => x.id === id),
  },
};

describe('addRecentEntities', () => {
  afterEach(() => {
    // Reset the mockUser
    mockUser.preferences = {};
  });

  it('Adds an entry to the recent entities list', async () => {
    await addRecentEntities(mockModels as any, 'user', ['DL_1']);
    expect(mockUser).toMatchObject({
      preferences: { recent_entities: { DL: { district: ['DL_1'] } } },
    });
  });
  it('Moves an entry to the top of the recent entities list if it already exists in the list', async () => {
    await addRecentEntities(mockModels as any, 'user', ['DL_3', 'DL_2', 'DL_1']);
    await addRecentEntities(mockModels as any, 'user', ['DL_3', 'DL_4']);
    expect(mockUser).toMatchObject({
      preferences: { recent_entities: { DL: { district: ['DL_4', 'DL_3', 'DL_1'] } } },
    });
  });
  it('Adds multiple entries to the recent entities list if it already exists in the list', async () => {
    await addRecentEntities(mockModels as any, 'user', ['DL_1', 'DL_2', 'DL_3']);
    expect(mockUser).toMatchObject({
      preferences: { recent_entities: { DL: { district: ['DL_3', 'DL_2', 'DL_1'] } } },
    });
  });
  it('Cycles out the last entry when exceeded MAX = 3', async () => {
    await addRecentEntities(mockModels as any, 'user', ['DL_1', 'DL_2', 'DL_3', 'DL_4', 'DL_5']);
    expect(mockUser).toMatchObject({
      preferences: { recent_entities: { DL: { district: ['DL_5', 'DL_4', 'DL_3'] } } },
    });
  });
  it('Separately stores lists for different entity types', async () => {
    await addRecentEntities(mockModels as any, 'user', [
      'DL_1',
      'DL_2',
      'DL_3',
      'DL_6',
      'DL_7',
      'DL_8',
    ]);
    expect(mockUser).toMatchObject({
      preferences: {
        recent_entities: {
          DL: { district: ['DL_3', 'DL_2', 'DL_1'], facility: ['DL_8', 'DL_7', 'DL_6'] },
        },
      },
    });
  });
  it('Separately stores lists for different countries', async () => {
    await addRecentEntities(mockModels as any, 'user', [
      'DL_1',
      'DL_2',
      'DL_3',
      'FJ_1',
      'FJ_2',
      'FJ_3',
    ]);
    expect(mockUser).toMatchObject({
      preferences: {
        recent_entities: {
          DL: { district: ['DL_3', 'DL_2', 'DL_1'] },
          FJ: { district: ['FJ_3', 'FJ_2', 'FJ_1'] },
        },
      },
    });
  });
});
