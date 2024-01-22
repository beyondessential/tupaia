/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { addRecentEntity } from '../utils';

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
    findById: (id: string) => mockUser,
    updateById: (id: string, update: any) => {
      mockUser.preferences = update.preferences;
    },
  },
  entity: {
    findById: (id: string) => mockEntities.find(x => x.id === id),
  },
};

describe('addRecentEntity', () => {
  afterEach(() => {
    // Reset the mockUser
    mockUser.preferences = {};
  });

  it('Adds an entry to the recent entities list', async () => {
    await addRecentEntity(mockModels as any, 'user', 'DL_1');
    expect(mockUser).toMatchObject({
      preferences: { recent_entities: { DL: { district: ['DL_1'] } } },
    });
  });
  it("Doesn't add an entry to the recent entities list if it already exists in the list", async () => {
    await addRecentEntity(mockModels as any, 'user', 'DL_1');
    await addRecentEntity(mockModels as any, 'user', 'DL_1');
    expect(mockUser).toMatchObject({
      preferences: { recent_entities: { DL: { district: ['DL_1'] } } },
    });
  });
  it('Adds multiple entries to the recent entities list if it already exists in the list', async () => {
    await addRecentEntity(mockModels as any, 'user', 'DL_1');
    await addRecentEntity(mockModels as any, 'user', 'DL_2');
    await addRecentEntity(mockModels as any, 'user', 'DL_3');
    expect(mockUser).toMatchObject({
      preferences: { recent_entities: { DL: { district: ['DL_3', 'DL_2', 'DL_1'] } } },
    });
  });
  it('Cycles out the last entry when exceeded MAX = 3', async () => {
    await addRecentEntity(mockModels as any, 'user', 'DL_1');
    await addRecentEntity(mockModels as any, 'user', 'DL_2');
    await addRecentEntity(mockModels as any, 'user', 'DL_3');
    await addRecentEntity(mockModels as any, 'user', 'DL_4');
    await addRecentEntity(mockModels as any, 'user', 'DL_5');
    expect(mockUser).toMatchObject({
      preferences: { recent_entities: { DL: { district: ['DL_5', 'DL_4', 'DL_3'] } } },
    });
  });
  it('Separately stores lists for different entity types', async () => {
    await addRecentEntity(mockModels as any, 'user', 'DL_1');
    await addRecentEntity(mockModels as any, 'user', 'DL_2');
    await addRecentEntity(mockModels as any, 'user', 'DL_3');
    await addRecentEntity(mockModels as any, 'user', 'DL_6');
    await addRecentEntity(mockModels as any, 'user', 'DL_7');
    await addRecentEntity(mockModels as any, 'user', 'DL_8');
    expect(mockUser).toMatchObject({
      preferences: {
        recent_entities: {
          DL: { district: ['DL_3', 'DL_2', 'DL_1'], facility: ['DL_8', 'DL_7', 'DL_6'] },
        },
      },
    });
  });
  it('Separately stores lists for different countries', async () => {
    await addRecentEntity(mockModels as any, 'user', 'DL_1');
    await addRecentEntity(mockModels as any, 'user', 'DL_2');
    await addRecentEntity(mockModels as any, 'user', 'DL_3');
    await addRecentEntity(mockModels as any, 'user', 'FJ_1');
    await addRecentEntity(mockModels as any, 'user', 'FJ_2');
    await addRecentEntity(mockModels as any, 'user', 'FJ_3');
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
