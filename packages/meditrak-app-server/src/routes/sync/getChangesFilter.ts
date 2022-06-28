/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { getHighestPossibleIdForGivenTime } from '@tupaia/database';
import { DbFilter } from '@tupaia/server-boilerplate';
import { getSupportedModels } from '../../sync';
import { MeditrakSyncQueueFields } from '../../models/MeditrakSyncQueue';

const getRecordTypeFilter = (appVersion: string, recordTypes: string[] | undefined) => {
  if (recordTypes) {
    return recordTypes;
  }

  return getSupportedModels(appVersion);
};

const getBaseFilter = (since: number): DbFilter<MeditrakSyncQueueFields> => {
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

export const getChangesFilter = (
  appVersion: string,
  since = 0,
  recordTypes?: string[],
): DbFilter<MeditrakSyncQueueFields> => {
  const baseFilter = getBaseFilter(since);
  const recordTypeFilter = getRecordTypeFilter(appVersion, recordTypes);
  const filter = recordTypeFilter ? { ...baseFilter, record_type: recordTypeFilter } : baseFilter;

  return filter;
};
