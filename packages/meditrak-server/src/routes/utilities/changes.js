/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { getHighestPossibleIdForGivenTime } from '@tupaia/database';

import { ValidationError } from '../../errors';

export const getColumnsForMeditrakApp = model => {
  const { meditrakConfig = {}, fields } = model;
  const { ignorableFields = [] } = meditrakConfig;

  return fields.filter(field => !ignorableFields.includes(field));
};

const getSupportedRecordTypes = async (models, appVersion) => {
  const minAppVersionByType = models.getMinAppVersionByType();
  return Object.keys(minAppVersionByType).filter(type => appVersion >= minAppVersionByType[type]);
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

export const getChangesFilter = async req => {
  const { appVersion, since: sinceIn = 0, recordTypes = null } = req.query;
  const since = parseFloat(sinceIn);
  if (isNaN(since)) {
    throw new ValidationError("The 'since' parameter must be a number.");
  }

  const filter = getBaseFilter(since);
  if (recordTypes) {
    filter.record_type = recordTypes.split(',');
  } else if (appVersion) {
    filter.record_type = await getSupportedRecordTypes(req.models, appVersion);
  }

  return filter;
};
