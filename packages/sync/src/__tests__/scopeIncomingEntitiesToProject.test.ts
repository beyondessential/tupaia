import { SYNC_SESSION_DIRECTION } from '../constants';
import { findSyncSnapshotRecords } from '../utils/findSyncSnapshotRecords';
import { updateSnapshotRecords } from '../utils/manageSnapshotTable';
import { scopeIncomingEntitiesToProject } from '../utils/scopeIncomingEntitiesToProject';

jest.mock('../utils/findSyncSnapshotRecords');
jest.mock('../utils/manageSnapshotTable');

const mockFindSyncSnapshotRecords = findSyncSnapshotRecords as jest.MockedFunction<
  typeof findSyncSnapshotRecords
>;
const mockUpdateSnapshotRecords = updateSnapshotRecords as jest.MockedFunction<
  typeof updateSnapshotRecords
>;

const SESSION_ID = 'session-1';
const database = {} as any;

const entitySnapshotRecord = (id: number, data: Record<string, unknown>) =>
  ({ id, recordId: data.id, isDeleted: false, recordType: 'entity', data } as any);

const surveyResponseSnapshotRecord = (id: number, data: Record<string, unknown>) =>
  ({ id, recordId: data.id, isDeleted: false, recordType: 'survey_response', data } as any);

const buildModels = (
  existingEntities: { id: string; project_id: string | null }[],
  surveys: { id: string; project_id: string }[],
) => {
  const entityModel = { find: jest.fn().mockResolvedValue(existingEntities) };
  const surveyModel = { find: jest.fn().mockResolvedValue(surveys) };
  return {
    entityModel,
    surveyModel,
    models: {
      getModelForDatabaseRecord: (recordType: string) => {
        if (recordType === 'entity') return entityModel;
        if (recordType === 'survey') return surveyModel;
        throw new Error(`unexpected model ${recordType}`);
      },
    } as any,
  };
};

const snapshotByType = (entity: any[], surveyResponse: any[] = []) =>
  mockFindSyncSnapshotRecords.mockImplementation(
    async (_db, _sid, _from, _limit, recordType) =>
      recordType === 'entity' ? entity : recordType === 'survey_response' ? surveyResponse : [],
  );

describe('scopeIncomingEntitiesToProject', () => {
  it('does nothing when no incoming entity needs scoping', async () => {
    snapshotByType([
      entitySnapshotRecord(1, { id: 'e-structural', type: 'country', project_id: null }),
      entitySnapshotRecord(2, { id: 'e-scoped', type: 'village', project_id: 'proj-existing' }),
    ]);
    const { models, entityModel } = buildModels([], []);

    await scopeIncomingEntitiesToProject(database, models, SESSION_ID);

    expect(entityModel.find).not.toHaveBeenCalled();
    expect(mockUpdateSnapshotRecords).not.toHaveBeenCalled();
  });

  it('preserves an existing entity’s project_id instead of nulling it (UPDATE case)', async () => {
    snapshotByType([entitySnapshotRecord(10, { id: 'e1', type: 'household', project_id: null })]);
    const { models } = buildModels([{ id: 'e1', project_id: 'proj-x' }], []);

    await scopeIncomingEntitiesToProject(database, models, SESSION_ID);

    expect(mockUpdateSnapshotRecords).toHaveBeenCalledTimes(1);
    expect(mockUpdateSnapshotRecords).toHaveBeenCalledWith(
      database,
      SESSION_ID,
      {
        data: JSON.stringify({ id: 'e1', type: 'household', project_id: 'proj-x' }),
        requiresRepull: true,
      },
      { id: 10 },
    );
  });

  it('derives a new entity’s project from its referencing survey_response (CREATE case)', async () => {
    snapshotByType(
      [entitySnapshotRecord(20, { id: 'e2', type: 'facility', project_id: null })],
      [surveyResponseSnapshotRecord(30, { id: 'sr1', entity_id: 'e2', survey_id: 's1' })],
    );
    const { models, surveyModel } = buildModels([], [{ id: 's1', project_id: 'proj-y' }]);

    await scopeIncomingEntitiesToProject(database, models, SESSION_ID);

    expect(surveyModel.find).toHaveBeenCalledWith(
      { id: ['s1'] },
      { columns: ['id', 'project_id'] },
    );
    expect(mockUpdateSnapshotRecords).toHaveBeenCalledTimes(1);
    expect(mockUpdateSnapshotRecords).toHaveBeenCalledWith(
      database,
      SESSION_ID,
      {
        data: JSON.stringify({ id: 'e2', type: 'facility', project_id: 'proj-y' }),
        requiresRepull: true,
      },
      { id: 20 },
    );
  });

  it('leaves an unresolvable entity untouched rather than dropping it', async () => {
    snapshotByType(
      [entitySnapshotRecord(40, { id: 'e-orphan', type: 'facility', project_id: null })],
      [], // no survey_response references it
    );
    const { models } = buildModels([], []);

    await scopeIncomingEntitiesToProject(database, models, SESSION_ID);

    expect(mockUpdateSnapshotRecords).not.toHaveBeenCalled();
  });

  it('handles a mixed batch: preserve, derive, skip structural/scoped, leave orphan', async () => {
    snapshotByType(
      [
        entitySnapshotRecord(101, { id: 'e1', type: 'household', project_id: null }), // existing -> preserve
        entitySnapshotRecord(102, { id: 'e2', type: 'facility', project_id: null }), // new -> derive
        entitySnapshotRecord(103, { id: 'e3', type: 'country', project_id: null }), // structural -> skip
        entitySnapshotRecord(104, { id: 'e4', type: 'village', project_id: 'proj-z' }), // scoped -> skip
        entitySnapshotRecord(105, { id: 'e5', type: 'facility', project_id: null }), // orphan -> skip
      ],
      [surveyResponseSnapshotRecord(201, { id: 'sr1', entity_id: 'e2', survey_id: 's1' })],
    );
    const { models, entityModel } = buildModels(
      [{ id: 'e1', project_id: 'proj-x' }],
      [{ id: 's1', project_id: 'proj-y' }],
    );

    await scopeIncomingEntitiesToProject(database, models, SESSION_ID);

    // only the three null-project non-structural entities are looked up
    expect(entityModel.find).toHaveBeenCalledWith(
      { id: ['e1', 'e2', 'e5'] },
      { columns: ['id', 'project_id'] },
    );
    // only e1 (preserve) and e2 (derive) get written back
    expect(mockUpdateSnapshotRecords).toHaveBeenCalledTimes(2);
    const scopedIds = mockUpdateSnapshotRecords.mock.calls.map(call => (call[3] as any).id);
    expect(scopedIds).toEqual([101, 102]);
  });

  it('queries only incoming, non-deleted entity snapshot records', async () => {
    snapshotByType([]);
    const { models } = buildModels([], []);

    await scopeIncomingEntitiesToProject(database, models, SESSION_ID);

    expect(mockFindSyncSnapshotRecords).toHaveBeenCalledWith(
      database,
      SESSION_ID,
      undefined,
      undefined,
      'entity',
      SYNC_SESSION_DIRECTION.INCOMING,
      'is_deleted IS FALSE',
    );
  });
});
