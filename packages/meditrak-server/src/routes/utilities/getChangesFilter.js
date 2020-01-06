/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { getHighestPossibleIdForGivenTime } from '@tupaia/database';
import { ValidationError } from '../../errors';

export const getChangesFilter = ({ since = 0, recordTypes = null }) => {
  since = parseFloat(since);
  if (isNaN(since)) {
    throw new ValidationError("The 'since' parameter must be a number.");
  }

  // Based on the 'since' query parameter, work out what the highest possible record id is that
  // the client could have already synchronised, and ignore any 'delete' type sync actions for
  // records with higher ids: if the client doesn't know about them there is no point in telling
  // them to delete them
  const highestPossibleSyncedId = getHighestPossibleIdForGivenTime(since);
  let changesFilter = {
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

  // Limit to comma separated list of supplied record types.
  if (recordTypes) {
    changesFilter = {
      record_type: recordTypes.split(','),
      _and_: {
        ...changesFilter,
      },
    };
  }

  return changesFilter;
};
