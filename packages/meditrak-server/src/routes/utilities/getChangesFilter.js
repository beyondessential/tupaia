/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { get } from 'lodash';
import semverCompare from 'semver-compare';

import { getHighestPossibleIdForGivenTime } from '@tupaia/database';
import { ValidationError } from '@tupaia/utils';
import { fetchRequestingMeditrakDevice } from './fetchRequestingMeditrakDevice';

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
    return recordTypes.split(',');
  }
  if (appVersion) {
    return getSupportedTypes(models, appVersion);
  }

  const meditrakDevice = await fetchRequestingMeditrakDevice(req);
  const unsupportedTypes = get(meditrakDevice, 'config.unsupportedTypes', []);
  if (unsupportedTypes.length > 0) {
    return { comparator: 'not in', comparisonValue: unsupportedTypes };
  }

  return null;
};

const getBaseFilter = since => {
  // Based on the 'since' query parameter, work out what the highest possible record id is that
  // the client could have already synchronised, and ignore any 'delete' type sync actions for
  // records with higher ids: if the client doesn't know about them there is no point in telling
  // them to delete them
  const highestPossibleSyncedId = getHighestPossibleIdForGivenTime(since);

  return {
    change_time: { comparator: '>', comparisonValue: since },
    _and_: {
      type: 'update',
      record_id: {
        comparisonType: 'orWhere',
        comparator: '<=',
        comparisonValue: highestPossibleSyncedId,
      },
    },
  };
};

const extractSinceValue = req => {
  const { since = 0 } = req.query;
  if (isNaN(since)) {
    throw new ValidationError("The 'since' parameter must be a number.");
  }

  return parseFloat(since);
};

export const getChangesFilter = async req => {
  const since = extractSinceValue(req);
  const filter = getBaseFilter(since);
  const recordTypeFilter = await getRecordTypeFilter(req);
  if (recordTypeFilter) {
    filter.record_type = recordTypeFilter;
  }

  return filter;
};
