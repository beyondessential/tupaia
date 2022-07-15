/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { TYPES } from '@tupaia/database';
import { Route } from '@tupaia/server-boilerplate';
import { DatabaseError } from '@tupaia/utils';
import { getChangesFilter } from './getChangesFilter';
import { getUnsupportedModelFields } from '../../sync';

type ChangeRecord = {
  action: 'update' | 'delete';
  recordType: string;
  timestamp: number;
  record?: Record<string, unknown>;
  error?: { error: string };
};

export type PullChangesRequest = Request<
  Record<string, never>,
  ChangeRecord[],
  Record<string, unknown>,
  { appVersion: string; since?: string; recordTypes?: string; limit?: string; offset?: string }
>;

const MAX_CHANGES_RETURNED = 100;

async function filterNullProperties(record: Record<string, unknown>) {
  const recordWithoutNulls: Record<string, unknown> = {};
  // Remove null entries to a) save bandwidth and b) remain consistent with previous mongo based db
  // which simply had no key for undefined properties, whereas postgres uses null
  Object.entries(record).forEach(([key, value]) => {
    if (value !== null) {
      recordWithoutNulls[key] = value;
    }
  });
  return recordWithoutNulls;
}

export class PullChangesRoute extends Route<PullChangesRequest> {
  private async getAppSupportColumns(recordType: string) {
    const model = this.req.models.getModelForDatabaseType(recordType);
    const fields = await model.fetchFieldNames();
    const unsupportedFields = getUnsupportedModelFields(recordType);
    return fields.filter(field => !unsupportedFields.includes(field));
  }

  public async buildResponse() {
    const {
      appVersion,
      since,
      recordTypes,
      limit = `${MAX_CHANGES_RETURNED}`,
      offset = '0',
    } = this.req.query;

    const filter = getChangesFilter(
      appVersion,
      since ? parseFloat(since) : undefined,
      recordTypes ? recordTypes.split(',') : undefined,
    );

    const changes = await this.req.models.meditrakSyncQueue.find(filter, {
      sort: ['change_time'],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    try {
      return await Promise.all(
        changes.map(async change => {
          const {
            type: action,
            record_type: recordType,
            record_id: recordId,
            change_time: timestamp,
          } = change;
          const columns = await this.getAppSupportColumns(recordType);
          const changeObject: ChangeRecord = { action, recordType, timestamp };
          if (action === 'delete') {
            changeObject.record = { id: recordId };
            if (recordType === TYPES.GEOGRAPHICAL_AREA) {
              // TODO LEGACY Deal with this bug on app end for v3 api
              changeObject.recordType = 'area';
            }
          } else {
            const record = await this.req.models.database.findById(recordType, recordId, {
              lean: true,
              columns,
            });
            if (!record) {
              const errorMessage = `Couldn't find record type ${recordType} with id ${recordId}`;
              changeObject.error = { error: errorMessage };
            } else {
              changeObject.record = await filterNullProperties(record);
            }
          }
          return changeObject;
        }),
      );
    } catch (error) {
      throw new DatabaseError('fetching changes', error);
    }
  }
}
