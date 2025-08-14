import { Request } from 'express';
import { getHighestPossibleIdForGivenTime, SqlQuery } from '@tupaia/database';
import { ValidationError } from '@tupaia/utils';
import { getSupportedDatabaseRecords } from '../../../sync';
import { MeditrakSyncQueryModifiers } from './types';

export const recordTypeFilter = (req: Request) => {
  const { appVersion, recordTypes = null } = req.query;

  if (typeof recordTypes === 'string') {
    const recordTypesArray = recordTypes.split(',');
    return {
      query: `record_type IN ${SqlQuery.record(recordTypesArray)}`,
      params: recordTypesArray,
    };
  }
  if (typeof appVersion === 'string') {
    const supportedRecordTypes = getSupportedDatabaseRecords(req.models, appVersion);
    return {
      query: `record_type IN ${SqlQuery.record(supportedRecordTypes)}`,
      params: supportedRecordTypes,
    };
  }

  return null;
};

// Based on the 'since' query parameter, work out what the highest possible record id is that
// the client could have already synchronised, and ignore any 'delete' type sync actions for
// records with higher ids: if the client doesn't know about them there is no point in telling
// them to delete them
export const deletesSinceLastSync = (since: number) => {
  let query = '';
  const params = [];

  const highestPossibleSyncedId = getHighestPossibleIdForGivenTime(since);
  // Only sync deletes that have occurred prior to the latest possibly synced record
  query = query.concat(`
    change_time > ? AND "type" = ? AND record_id <= ?
  `);
  params.push(since, 'delete', highestPossibleSyncedId);

  return { query, params };
};

export const selectFromClause = (select: string) => `
  SELECT ${select} FROM permissions_based_meditrak_sync_queue
`;

export const extractSinceValue = (req: Request) => {
  const { since = 0 } = req.query;

  if (typeof since === 'number') return since;

  const parsedSince = parseFloat(since as string);

  if (isNaN(parsedSince)) {
    throw new ValidationError("The 'since' parameter must be a number.");
  }

  return parsedSince;
};

export const getModifiers = ({ sort, limit, offset }: MeditrakSyncQueryModifiers) => {
  let query = '';
  const params = [];

  if (sort) {
    query = query.concat(`
    ORDER BY ${sort}
    `);
  }

  if (limit !== undefined) {
    query = query.concat(`
    LIMIT ?
    `);
    params.push(limit);
  }

  if (offset !== undefined) {
    query = query.concat(`
    OFFSET ?
    `);
    params.push(offset);
  }

  return { query, params };
};

export const buildMeditrakSyncQuery = async <Results>(
  req: Request,
  select: string,
  { sort, limit, offset }: MeditrakSyncQueryModifiers = {},
) => {
  const since = extractSinceValue(req);

  const query = new SqlQuery<Results>();
  query.append(selectFromClause(select));
  query.append(`WHERE
  (`);
  query.append({ query: '(change_time > ? AND "type" = ?)', params: [since, 'update'] });
  query.append(`
  OR (`);
  query.append(deletesSinceLastSync(since));
  query.append(`
  ))`);
  const filter = recordTypeFilter(req);
  if (filter) {
    query.append(`
      AND `);
    query.append(filter);
  }

  query.append(getModifiers({ sort, limit, offset }));

  return { query };
};
