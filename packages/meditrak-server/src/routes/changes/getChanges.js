/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { respond, DatabaseError } from '@tupaia/utils';
import { TYPES } from '@tupaia/database';
import { getChangesFilter, getRecordForMeditrakApp } from './helpers';

const MAX_CHANGES_RETURNED = 100;

/**
 * Responds to GET requests to the /changes endpoint by returning changes in oldest -> newest order,
 * up to a limit passed in the query parameters or 1000.
 * @param {object}  event    - event data (e.g. url, query parameters)
 * @param {object}  context  - runtime info (Lambda metadata)
 * @param {func}    res - function to call with response, takes (Error error, Object result)
 */
export async function getChanges(req, res) {
  const { database, models } = req;
  const { limit = MAX_CHANGES_RETURNED, offset = 0 } = req.query;

  try {
    const filter = await getChangesFilter(req);
    const changes = await database.find(TYPES.MEDITRAK_SYNC_QUEUE, filter, {
      sort: ['change_time'],
      limit,
      offset,
    });
    const changesToSend = await Promise.all(
      changes.map(async change => {
        const {
          type: action,
          record_type: recordType,
          record_id: recordId,
          change_time: timestamp,
        } = change;
        const changeObject = { action, recordType, timestamp };
        if (action === 'delete') {
          changeObject.record = { id: recordId };
          if (recordType === TYPES.GEOGRAPHICAL_AREA) {
            // TODO LEGACY Deal with this bug on app end for v3 api
            changeObject.recordType = 'area';
          }
        } else {
          const model = models.getModelForDatabaseType(recordType);
          const record = await getRecordForMeditrakApp(model, recordId);
          if (!record) {
            const errorMessage = `Couldn't find record type ${recordType} with id ${recordId}`;
            changeObject.error = { error: errorMessage };
          } else {
            changeObject.record = record;
          }
        }
        return changeObject;
      }),
    );
    respond(res, changesToSend);
    return;
  } catch (error) {
    throw new DatabaseError('fetching changes', error);
  }
}
