import keyBy from 'lodash.keyby';
import groupBy from 'lodash.groupby';

import { Request } from 'express';

import { RECORDS } from '@tupaia/database';
import { Route } from '@tupaia/server-boilerplate';
import { DatabaseError } from '@tupaia/utils';
import { MeditrakSyncQueue } from '@tupaia/types';
import { getSupportedModels, getUnsupportedModelFields } from '../../../sync';
import { MeditrakAppServerModelRegistry } from '../../../types';
import { getSyncRecordTranslator } from '../../../sync/appSupportedModels';
import { buildMeditrakSyncQuery } from './meditrakSyncQuery';
import { buildPermissionsBasedMeditrakSyncQuery } from './permissionsBasedMeditrakSyncQuery';
import { supportsPermissionsBasedSync } from './supportsPermissionsBasedSync';

type ChangeRecord = {
  action: MeditrakSyncQueue['type'];
  recordType: MeditrakSyncQueue['record_type'];
  timestamp: MeditrakSyncQueue['change_time'];
  record?: Record<string, unknown>;
  error?: { error: string };
};

export type PullChangesRequest = Request<
  Record<string, never>,
  ChangeRecord[],
  Record<string, unknown>,
  {
    appVersion: string;
    since?: string;
    recordTypes?: string;
    limit?: string;
    offset?: string;
    countriesSynced?: string;
    permissionGroupsSynced?: string;
  }
>;

const MAX_CHANGES_RETURNED = 100;

const filterNullProperties = (record: Record<string, unknown>) => {
  const recordWithoutNulls: Record<string, unknown> = {};
  // Remove null entries to a) save bandwidth and b) remain consistent with previous mongo based db
  // which simply had no key for undefined properties, whereas postgres uses null
  Object.entries(record).forEach(([key, value]) => {
    if (value !== null) {
      recordWithoutNulls[key] = value;
    }
  });
  return recordWithoutNulls;
};

const translateRecordForSync = (
  models: MeditrakAppServerModelRegistry,
  recordType: string,
  appVersion: string,
  record: Record<string, unknown>,
) => {
  const nullFilteredRecord = filterNullProperties(record);
  const modelName = models.getModelNameForDatabaseRecord(recordType);
  if (!modelName) {
    throw new Error(`Cannot find model for record type: ${recordType}`);
  }

  const syncRecordTranslator = getSyncRecordTranslator(modelName);

  if (!syncRecordTranslator) {
    return nullFilteredRecord;
  }

  return syncRecordTranslator(appVersion, nullFilteredRecord);
};

export class PullChangesRoute extends Route<PullChangesRequest> {
  private async getAppSupportColumns(recordType: string) {
    const modelName = getSupportedModels().find(
      name => this.req.models[name].databaseRecord === recordType,
    );
    if (!modelName) {
      throw new Error(`Couldn't find model for record type: ${recordType}`);
    }
    const model = this.req.models[modelName];
    const fields = await model.fetchFieldNames();
    const unsupportedFields = getUnsupportedModelFields(modelName);
    return fields.filter(field => !unsupportedFields.includes(field));
  }

  public async buildResponse() {
    const { appVersion, limit = `${MAX_CHANGES_RETURNED}`, offset = '0' } = this.req.query;
    const { models } = this.req;

    try {
      let changes: Required<MeditrakSyncQueue>[];
      const select = (await models.meditrakSyncQueue.fetchFieldNames()).join(', ');
      const modifiers = {
        sort: 'change_time ASC',
        limit,
        offset,
      };

      if (supportsPermissionsBasedSync(appVersion)) {
        const { query } = await buildPermissionsBasedMeditrakSyncQuery<
          Required<MeditrakSyncQueue>[]
        >(this.req, select, modifiers);
        changes = await query.executeOnDatabase(models.database);
      } else {
        const { query } = await buildMeditrakSyncQuery<Required<MeditrakSyncQueue>[]>(
          this.req,
          select,
          modifiers,
        );
        changes = await query.executeOnDatabase(models.database);
      }

      const changesByRecordType = groupBy(changes, 'record_type');
      const recordTypesToSync = Object.keys(changesByRecordType);
      const columnNamesByRecordType = Object.fromEntries(
        await Promise.all(
          recordTypesToSync.map(async recordType => [
            recordType,
            await this.getAppSupportColumns(recordType),
          ]),
        ),
      );
      const changeRecords = (
        await Promise.all(
          Object.entries(changesByRecordType).map(async ([recordType, changesForType]) => {
            const changeIds = changesForType.map(change => change.record_id);
            const columns = columnNamesByRecordType[recordType];
            return models.database.find(recordType, { id: changeIds }, { lean: true, columns });
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
        const changeObject: ChangeRecord = { action, recordType, timestamp };
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
            changeObject.record = translateRecordForSync(
              models,
              recordType,
              appVersion,
              record as unknown as Record<string, unknown>,
            );
          }
        }
        return changeObject;
      });

      return changesToSend;
    } catch (error) {
      throw new DatabaseError('fetching changes', error);
    }
  }
}
