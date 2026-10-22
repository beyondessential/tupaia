import chai from 'chai';
import { clearTestData, generateId } from '@tupaia/database';
import { getModels, upsertEntity } from '../testUtilities';
import { MeditrakSyncRecordUpdater } from '../../database/meditrakSyncQueue/MeditrakSyncRecordUpdater';

const { expect } = chai;

/**
 * Post entity-hierarchy epic a code can have multiple entity rows (one per project), but
 * MediTrak sees entities as canonical (one row per code = MIN(id) for that code). An entity
 * delete is re-canonicalised: a full deletion syncs delete(X); a canonical delete with siblings
 * syncs delete(X) + upsert of the new canonical; a non-canonical sibling delete syncs nothing.
 */
describe('MeditrakSyncRecordUpdater — entity delete re-canonicalisation (TUP-3067)', () => {
  const models = getModels();
  const updater = new MeditrakSyncRecordUpdater(models);

  // ObjectID hex ids sort lexicographically, matching how MIN(id) picks the canonical row.
  const lowId = () => `00000000${generateId().slice(8)}`;
  const highId = () => `ffffffff${generateId().slice(8)}`;

  const entityDeleteChange = (recordId, code) => [
    { record_type: 'entity', record_id: recordId, type: 'delete', old_record: { code } },
  ];

  const uniqueCode = () => `ZZDEL_${generateId()}`.slice(0, 30);

  afterEach(async () => {
    await clearTestData(models.database);
  });

  it('re-canonicalises a canonical delete: enqueues delete(X) and upsert(Y) with delete first', async () => {
    const code = uniqueCode();
    const deletedId = lowId(); // X was the canonical (lowest) id
    const survivor = await upsertEntity({ id: highId(), code }); // Y remains, higher id

    await updater.updateSyncRecords(entityDeleteChange(deletedId, code));

    const deleteQueued = await models.meditrakSyncQueue.findOne({ record_id: deletedId });
    const upsertQueued = await models.meditrakSyncQueue.findOne({ record_id: survivor.id });

    expect(deleteQueued, 'delete of old canonical enqueued').to.exist;
    expect(deleteQueued.type).to.equal('delete');
    expect(upsertQueued, 'upsert of new canonical enqueued').to.exist;
    expect(upsertQueued.type).to.equal('update');
    expect(Number(deleteQueued.change_time)).to.be.below(Number(upsertQueued.change_time));
  });

  it('does NOT enqueue anything when a non-canonical sibling is deleted', async () => {
    const code = uniqueCode();
    await upsertEntity({ id: lowId(), code }); // the canonical row survives (lower id)
    const deletedId = highId(); // a higher-id duplicate that the device never held

    await updater.updateSyncRecords(entityDeleteChange(deletedId, code));

    expect(await models.meditrakSyncQueue.findOne({ record_id: deletedId })).to.not.exist;
  });

  it('enqueues a single delete when no rows remain for the code (true full deletion)', async () => {
    const code = uniqueCode(); // no entity exists with this code
    const deletedId = generateId();

    await updater.updateSyncRecords(entityDeleteChange(deletedId, code));

    const queued = await models.meditrakSyncQueue.findOne({ record_id: deletedId });
    expect(queued).to.exist;
    expect(queued.type).to.equal('delete');

    const allForCode = await models.meditrakSyncQueue.find({ record_type: 'entity' });
    expect(allForCode).to.have.lengthOf(1);
  });

  it('upserts the lexicographic MIN of the surviving siblings as the new canonical', async () => {
    const code = uniqueCode();
    const deletedId = lowId(); // X was the canonical
    const middle = `88888888${generateId().slice(8)}`;
    const highest = highId();
    // Insert out of id order to ensure MIN is chosen, not insertion order.
    await upsertEntity({ id: highest, code });
    const expectedCanonical = await upsertEntity({ id: middle, code });

    await updater.updateSyncRecords(entityDeleteChange(deletedId, code));

    const upsertQueued = await models.meditrakSyncQueue.findOne({ record_id: expectedCanonical.id });
    expect(upsertQueued, 'MIN survivor enqueued as new canonical').to.exist;
    expect(upsertQueued.type).to.equal('update');
    expect(await models.meditrakSyncQueue.findOne({ record_id: highest })).to.not.exist;
  });

  it('passes a non-delete entity change straight through', async () => {
    const entity = await upsertEntity({ code: uniqueCode() });

    await updater.updateSyncRecords([
      { record_type: 'entity', record_id: entity.id, type: 'update' },
    ]);

    const queued = await models.meditrakSyncQueue.findOne({ record_id: entity.id });
    expect(queued).to.exist;
    expect(queued.type).to.equal('update');
  });
});
