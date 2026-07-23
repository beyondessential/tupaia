import chai from 'chai';
import { clearTestData, generateId } from '@tupaia/database';
import { getModels, upsertEntity } from '../testUtilities';
import { MeditrakSyncRecordUpdater } from '../../database/meditrakSyncQueue/MeditrakSyncRecordUpdater';

const { expect } = chai;

/**
 * Post entity-hierarchy epic a code can have multiple entity rows (one per project), but
 * MediTrak sees entities as canonical (one row per code). An entity delete should only reach
 * MediTrak on a true full deletion — never for a duplicate-only deletion, which would make
 * MediTrak drop an entity that still exists in another project.
 */
describe('MeditrakSyncRecordUpdater — entity delete suppression (TUP-3067)', () => {
  const models = getModels();
  const updater = new MeditrakSyncRecordUpdater(models);

  const entityDeleteChange = (recordId, code) => [
    { record_type: 'entity', record_id: recordId, type: 'delete', old_record: { code } },
  ];

  afterEach(async () => {
    await clearTestData(models.database);
  });

  it('does NOT enqueue a delete when another row still holds the code (duplicate-only deletion)', async () => {
    const code = `ZZDEL_${generateId()}`.slice(0, 30);
    await upsertEntity({ code }); // a surviving row still holds this code
    const deletedId = generateId(); // a different project-specific row that was just deleted

    await updater.updateSyncRecords(entityDeleteChange(deletedId, code));

    expect(await models.meditrakSyncQueue.findOne({ record_id: deletedId })).to.not.exist;
  });

  it('enqueues a delete when no rows remain for the code (true full deletion)', async () => {
    const code = `ZZDEL_${generateId()}`.slice(0, 30); // no entity exists with this code
    const deletedId = generateId();

    await updater.updateSyncRecords(entityDeleteChange(deletedId, code));

    const queued = await models.meditrakSyncQueue.findOne({ record_id: deletedId });
    expect(queued).to.exist;
    expect(queued.type).to.equal('delete');
  });
});
