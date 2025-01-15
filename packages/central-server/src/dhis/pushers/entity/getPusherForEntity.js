import { NonExistingRecordPusher } from './NonExistingRecordPusher';
import { OrganisationUnitPusher } from './OrganisationUnitPusher';
import { TrackedEntityPusher } from './TrackedEntityPusher';

const getUpdatePusher = async (models, change) => {
  const entity = await models.entity.findById(change.record_id);
  if (!entity) {
    return NonExistingRecordPusher;
  }

  return entity.isOrganisationUnit() ? OrganisationUnitPusher : TrackedEntityPusher;
};

const getDeletePusher = async (models, change) => {
  const syncLogRecord = await models.dhisSyncLog.findOne({ record_id: change.record_id });
  if (!syncLogRecord?.data) {
    return NonExistingRecordPusher;
  }

  const { type } = JSON.parse(syncLogRecord.data);

  return models.entity.isOrganisationUnitType(type) ? OrganisationUnitPusher : TrackedEntityPusher;
};

export async function getPusherForEntity(models, change) {
  const getPusher = change.type === 'update' ? getUpdatePusher : getDeletePusher;
  return getPusher(models, change);
}
