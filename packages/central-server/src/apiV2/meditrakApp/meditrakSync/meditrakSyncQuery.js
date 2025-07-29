import { get } from 'es-toolkit/compat';
import { compare } from 'compare-versions';
import { getHighestPossibleIdForGivenTime, SqlQuery } from '@tupaia/database';
import { ValidationError } from '@tupaia/utils';
import { fetchRequestingMeditrakDevice } from '../utilities';

const isAppVersionGreaterThanMin = (version, minVersion) => compare(version, minVersion, '>=');

const getSupportedTypes = async (models, appVersion) => {
  const minAppVersionByType = models.getMinAppVersionByType();
  return Object.keys(minAppVersionByType).filter(type =>
    isAppVersionGreaterThanMin(appVersion, minAppVersionByType[type]),
  );
};

export const recordTypeFilter = async req => {
  const { models } = req;
  const { appVersion, recordTypes = null } = req.query;

  if (recordTypes) {
    const recordTypesArray = recordTypes.split(',');
    return {
      query: `record_type IN ${SqlQuery.record(recordTypesArray)}`,
      params: recordTypesArray,
    };
  }
  if (appVersion) {
    const supportedTypes = await getSupportedTypes(models, appVersion);
    return {
      query: `record_type IN ${SqlQuery.record(supportedTypes)}`,
      params: supportedTypes,
    };
  }

  const meditrakDevice = await fetchRequestingMeditrakDevice(req);
  const unsupportedTypes = get(meditrakDevice, 'config.unsupportedTypes', []);
  if (unsupportedTypes.length > 0) {
    return {
      query: `record_type NOT IN ${SqlQuery.record(unsupportedTypes)}`,
      params: unsupportedTypes,
    };
  }

  return null;
};

// Based on the 'since' query parameter, work out what the highest possible record id is that
// the client could have already synchronised, and ignore any 'delete' type sync actions for
// records with higher ids: if the client doesn't know about them there is no point in telling
// them to delete them
export const deletesSinceLastSync = since => {
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

export const selectFromClause = select => `
  SELECT ${select} FROM permissions_based_meditrak_sync_queue
`;

export const extractSinceValue = req => {
  const { since = 0 } = req.query;
  if (isNaN(since)) {
    throw new ValidationError("The 'since' parameter must be a number.");
  }

  return parseFloat(since);
};

export const getModifiers = (sort, limit, offset) => {
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

export const buildMeditrakSyncQuery = async (req, { select, sort, limit, offset }) => {
  const since = extractSinceValue(req);

  const query = new SqlQuery();
  query.append(selectFromClause(select));
  query.append(`WHERE
  (`);
  query.append({ query: '(change_time > ? AND "type" = ?)', params: [since, 'update'] });
  query.append(`
  OR (`);
  query.append(deletesSinceLastSync(since));
  query.append(`
  ))`);
  const filter = await recordTypeFilter(req);
  if (filter) {
    query.append(`
      AND `);
    query.append(filter);
  }

  query.append(getModifiers(sort, limit, offset));

  return { query };
};
