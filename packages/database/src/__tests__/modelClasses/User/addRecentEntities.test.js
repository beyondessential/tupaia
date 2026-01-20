import { addRecentEntities } from '../../../core/modelClasses/User/addRecentEntities';
import { getTestModels, upsertDummyRecord } from '../../../server';

const NUM_MOCK_ENTITIES = 10;
const USER_ID = 'user';

describe('addRecentEntities', () => {
  let mockEntities;
  let models;
  beforeAll(async () => {
    models = getTestModels();
    mockEntities = await Promise.all(
      [...Array(NUM_MOCK_ENTITIES).keys()].flatMap(async x => {
        const entity1 = await upsertDummyRecord(models.entity, {
          id: `DL_${x}`,
          country_code: 'DL',
          type: x > NUM_MOCK_ENTITIES / 2 ? 'facility' : 'district',
        });
        const entity2 = await upsertDummyRecord(models.entity, {
          id: `FJ_${x}`,
          country_code: 'FJ',
          type: x > NUM_MOCK_ENTITIES / 2 ? 'facility' : 'district',
        });
        return [entity1, entity2];
      }),
    );
    await upsertDummyRecord(models.user, { id: USER_ID });
  });

  beforeEach(async () => {
    // Reset the mockUser
    await models.user.updateById(USER_ID, { preferences: {} });
  });

  it('Adds an entry to the recent entities list', async () => {
    await addRecentEntities(models, USER_ID, ['DL_1']);
    expect((await models.user.findById(USER_ID)).preferences).toMatchObject({
      recent_entities: { DL: { district: ['DL_1'] } },
    });
  });
  it('Moves an entry to the top of the recent entities list if it already exists in the list', async () => {
    await addRecentEntities(models, USER_ID, ['DL_3', 'DL_2', 'DL_1']); // 1, 2, 3
    await addRecentEntities(models, USER_ID, ['DL_3', 'DL_4']); // 4, 3 1
    expect((await models.user.findById(USER_ID)).preferences).toMatchObject({
      recent_entities: { DL: { district: ['DL_4', 'DL_3', 'DL_1'] } },
    });
  });
  it('Adds multiple entries to the recent entities list if it already exists in the list', async () => {
    await addRecentEntities(models, USER_ID, ['DL_1', 'DL_2', 'DL_3']);
    expect((await models.user.findById(USER_ID)).preferences).toMatchObject({
      recent_entities: { DL: { district: ['DL_3', 'DL_2', 'DL_1'] } },
    });
  });
  it('Cycles out the last entry when exceeded MAX = 3', async () => {
    await addRecentEntities(models, USER_ID, ['DL_1', 'DL_2', 'DL_3', 'DL_4', 'DL_5']);
    expect((await models.user.findById(USER_ID)).preferences).toMatchObject({
      recent_entities: { DL: { district: ['DL_5', 'DL_4', 'DL_3'] } },
    });
  });
  it('Separately stores lists for different entity types', async () => {
    await addRecentEntities(models, USER_ID, ['DL_1', 'DL_2', 'DL_3', 'DL_6', 'DL_7', 'DL_8']);
    expect((await models.user.findById(USER_ID)).preferences).toMatchObject({
      recent_entities: {
        DL: { district: ['DL_3', 'DL_2', 'DL_1'], facility: ['DL_8', 'DL_7', 'DL_6'] },
      },
    });
  });
  it('Separately stores lists for different countries', async () => {
    await addRecentEntities(models, USER_ID, ['DL_1', 'DL_2', 'DL_3', 'FJ_1', 'FJ_2', 'FJ_3']);
    expect((await models.user.findById(USER_ID)).preferences).toMatchObject({
      recent_entities: {
        DL: { district: ['DL_3', 'DL_2', 'DL_1'] },
        FJ: { district: ['FJ_3', 'FJ_2', 'FJ_1'] },
      },
    });
  });
});
