import { clearTestData, getTestModels, generateId } from '@tupaia/database';
import { TestModelRegistry } from '../../types';
import { MeditrakSyncRecordUpdater } from '../../../sync/MeditrakSyncRecordUpdater';
import { upsertEntity } from '../../utilities/database';

/**
 * Post entity-hierarchy epic a code can have multiple entity rows (one per project), but MediTrak
 * sees one row per code. An entity delete should only reach MediTrak when the code is fully gone,
 * never for a duplicate-only deletion (which would make MediTrak drop an entity still in use).
 */
describe('MeditrakSyncRecordUpdater - entity delete canonicalisation', () => {
  const models = getTestModels() as unknown as TestModelRegistry;
  const updater = new MeditrakSyncRecordUpdater(models);

  const entityDeleteChange = (recordId: string, code: string) => [
    { record_type: 'entity', record_id: recordId, type: 'delete' as const, old_record: { code } },
  ];

  afterEach(async () => {
    await clearTestData(models.database);
  });

  it('does NOT enqueue a delete when another row still holds the code (duplicate-only deletion)', async () => {
    const code = `ZZDEL_${generateId()}`.slice(0, 30);
    await upsertEntity(models, { code }); // a surviving row still holds this code
    const deletedId = generateId(); // a (different) project-specific row that was just deleted

    await updater.updateSyncRecords(entityDeleteChange(deletedId, code));

    expect(await models.meditrakSyncQueue.findOne({ record_id: deletedId })).toBeNull();
  });

  it('enqueues a delete when no rows remain for the code (true full deletion)', async () => {
    const code = `ZZDEL_${generateId()}`.slice(0, 30); // no entity exists with this code
    const deletedId = generateId();

    await updater.updateSyncRecords(entityDeleteChange(deletedId, code));

    const queued = await models.meditrakSyncQueue.findOne({ record_id: deletedId });
    expect(queued).not.toBeNull();
    expect(queued?.type).toBe('delete');
  });
});
