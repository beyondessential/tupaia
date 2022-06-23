/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { get } from 'lodash';
import semverCompare from 'semver-compare';

import { getHighestPossibleIdForGivenTime, SqlQuery } from '@tupaia/database';
import { ValidationError } from '@tupaia/utils';
import { fetchRequestingMeditrakDevice } from './fetchRequestingMeditrakDevice';
import {
  getCountriesAndPermissionsToSync,
  getPermissionsWhereClause,
} from './permissionsBasedChangeFilter';

const isAppVersionGreaterThanMin = (version, minVersion) => semverCompare(version, minVersion) >= 0;

const getSupportedTypes = async (models, appVersion) => {
  const minAppVersionByType = models.getMinAppVersionByType();
  return Object.keys(minAppVersionByType).filter(type =>
    isAppVersionGreaterThanMin(appVersion, minAppVersionByType[type]),
  );
};

const getRecordTypeFilter = async req => {
  const { models } = req;
  const { appVersion, recordTypes = null } = req.query;

  if (recordTypes) {
    return { comparator: 'IN', comparisonValue: recordTypes.split(',') };
  }
  if (appVersion) {
    return { comparator: 'IN', comparisonValue: await getSupportedTypes(models, appVersion) };
  }

  const meditrakDevice = await fetchRequestingMeditrakDevice(req);
  const unsupportedTypes = get(meditrakDevice, 'config.unsupportedTypes', []);
  if (unsupportedTypes.length > 0) {
    return { comparator: 'NOT IN', comparisonValue: unsupportedTypes };
  }

  return null;
};

const getSelectFromClause = select => `
  SELECT ${select} FROM permissions_based_meditrak_sync_queue
`;

const getWhere = async (req, since, permissionsBasedFilter) => {
  // Based on the 'since' query parameter, work out what the highest possible record id is that
  // the client could have already synchronised, and ignore any 'delete' type sync actions for
  // records with higher ids: if the client doesn't know about them there is no point in telling
  // them to delete them
  const highestPossibleSyncedId = getHighestPossibleIdForGivenTime(since);

  let query = `
    change_time > ?
    AND (
  `;
  const params = [since];

  if (permissionsBasedFilter) {
    const {
      query: permissionsClauseQuery,
      params: permissionsClauseParams,
    } = getPermissionsWhereClause(permissionsBasedFilter);
    query = query.concat(permissionsClauseQuery);
    params.push(...permissionsClauseParams);
  } else {
    // If not permissions based filter just sync all updates
    query = query.concat(`
    "type" = ?
    `);
    params.push('update');
  }

  // Only sync deletes that have occurred prior to the latest possibly synced record
  query = query.concat(`
    OR ("type" = ? AND record_id <= ?))
  `);
  params.push('delete', highestPossibleSyncedId);

  const recordTypeFilter = await getRecordTypeFilter(req);

  if (recordTypeFilter) {
    const { comparator, comparisonValue } = recordTypeFilter;
    query = query.concat(`
      AND record_type ${comparator} ${SqlQuery.record(comparisonValue)}
    `);
    params.push(...comparisonValue);
  }

  return { query, params };
};

const extractSinceValue = req => {
  const { since = 0 } = req.query;
  if (isNaN(since)) {
    throw new ValidationError("The 'since' parameter must be a number.");
  }

  return parseFloat(since);
};

export const getChangesFilter = async (req, { select, sort, limit, offset }) => {
  const since = extractSinceValue(req);

  let query = '';
  const params = [];
  query = query.concat(getSelectFromClause(select));
  const { query: whereQuery, params: whereParams } = await getWhere(req, since);
  query = query.concat(`WHERE
  ${whereQuery}`);
  params.push(...whereParams);

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

  return { query: new SqlQuery(query, params) };
};

export const getPermissionsBasedChangesFilter = async (req, { select, sort, limit, offset }) => {
  const since = extractSinceValue(req);
  const permissionBasedFilter = await getCountriesAndPermissionsToSync(req);

  let query = '';
  const params = [];
  const { unsynced, synced } = permissionBasedFilter;
  if (unsynced) {
    query = query.concat(getSelectFromClause(select));
    query = query.concat(`WHERE (
    `);
    const { query: whereQuery, params: whereParams } = await getWhere(req, 0, unsynced);
    query = query.concat(whereQuery);
    params.push(...whereParams);
  }

  if (unsynced && synced) {
    query = query.concat(`
      ) OR (
      `);
  }

  if (synced) {
    if (!unsynced) {
      query = query.concat(getSelectFromClause(select));
      query = query.concat(`WHERE (
        `);
    }
    const { query: whereQuery, params: whereParams } = await getWhere(req, since, synced);
    query = query.concat(whereQuery);
    params.push(...whereParams);
  }

  query = query.concat(`)
  `);

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

  const countriesInSync = [...(unsynced?.countries || []), ...(synced?.countries || [])];
  const permissionGroupsInSync = [
    ...(unsynced?.permissionGroups || []),
    ...(synced?.permissionGroups || []),
  ];

  return {
    query: new SqlQuery(query, params),
    countries: countriesInSync,
    permissionGroups: permissionGroupsInSync,
  };
};
