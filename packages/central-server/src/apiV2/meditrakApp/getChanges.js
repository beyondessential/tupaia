import { groupBy, keyBy } from 'es-toolkit/compat';

import { RECORDS } from '@tupaia/database';
import { DatabaseError, respond } from '@tupaia/utils';

import { allowNoPermissions } from '../../permissions';
import {
  buildMeditrakSyncQuery,
  buildPermissionsBasedMeditrakSyncQuery,
  supportsPermissionsBasedSync,
} from './meditrakSync';
import { getColumnsForMeditrakApp } from './utilities';

const MAX_CHANGES_RETURNED = 100;

// TODO: Tidy this up as part of RN-502

/**
 * Gets the record ready to sync down to a sync client, transforming any properties as required
 */
function getRecordForSync(models, record, recordType, appVersion) {
  const recordWithoutNulls = {};
  // Remove null entries to a) save bandwidth and b) remain consistent with previous mongo based db
  // which simply had no key for undefined properties, whereas postgres uses null
  Object.entries(record).forEach(([key, value]) => {
    if (value !== null) {
      recordWithoutNulls[key] = value;
    }
  });

  const model = models.getModelForDatabaseRecord(recordType);

  // Translate values in columns based on meditrak app version
  const translatedRecord = model?.meditrakConfig.translateRecordForSync
    ? model.meditrakConfig.translateRecordForSync(recordWithoutNulls, appVersion)
    : recordWithoutNulls;
  return translatedRecord;
}

/**
 * Responds to GET requests to the /changes endpoint by returning changes in oldest -> newest order,
 * up to a limit passed in the query parameters or 1000.
 * @param {object}  event    - event data (e.g. url, query parameters)
 * @param {object}  context  - runtime info (Lambda metadata)
 * @param {func}    res - function to call with response, takes (Error error, Object result)
 */
export async function getChanges(req, res) {
  const { database, models } = req;
  const { limit = MAX_CHANGES_RETURNED, offset = 0, appVersion } = req.query;

  await req.assertPermissions(allowNoPermissions);

  try {
    const queryBuilder = supportsPermissionsBasedSync(appVersion)
      ? buildPermissionsBasedMeditrakSyncQuery
      : buildMeditrakSyncQuery;
    const { query } = await queryBuilder(req, {
      select: (await models.meditrakSyncQueue.fetchFieldNames()).join(', '),
      sort: 'change_time ASC',
      limit,
      offset,
    });
    const changes = await query.executeOnDatabase(database);
    const changesByRecordType = groupBy(changes, 'record_type');
    const recordTypesToSync = Object.keys(changesByRecordType);
    const columnNamesByRecordType = Object.fromEntries(
      await Promise.all(
        recordTypesToSync.map(async recordType => [
          recordType,
          await getColumnsForMeditrakApp(models.getModelForDatabaseRecord(recordType)),
        ]),
      ),
    );
    const changeRecords = (
      await Promise.all(
        Object.entries(changesByRecordType).map(async ([recordType, changesForType]) => {
          const changeIds = changesForType.map(change => change.record_id);
          const columns = columnNamesByRecordType[recordType];
          return database.find(recordType, { id: changeIds }, { lean: true, columns });
        }),
      )
    ).flat();
    const changeRecordsById = keyBy(changeRecords, 'id');

    const changesToSend = changes.map(change => {
      const {
        type: action,
        record_type: recordType,
        record_id: recordId,
        change_time: timestamp,
      } = change;
      const changeObject = { action, recordType, timestamp };
      if (action === 'delete') {
        changeObject.record = { id: recordId };
        if (recordType === RECORDS.GEOGRAPHICAL_AREA) {
          // TODO LEGACY Deal with this bug on app end for v3 api
          changeObject.recordType = 'area';
        }
      } else {
        const record = changeRecordsById[recordId];
        if (!record) {
          const errorMessage = `Couldn't find record type ${recordType} with id ${recordId}`;
          changeObject.error = { error: errorMessage };
        } else {
          changeObject.record = getRecordForSync(models, record, recordType, appVersion);
        }
      }
      return changeObject;
    });
    respond(res, changesToSend);
    return;
  } catch (error) {
    throw new DatabaseError('fetching changes', error);
  }
}
