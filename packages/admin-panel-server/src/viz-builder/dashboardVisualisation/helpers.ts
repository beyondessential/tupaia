/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { isNil, omitBy } from 'lodash';

export const extractFetch = (config: Record<string, unknown>) => {
  const { dataElements, dataGroups, aggregations, startDate, endDate } = config;

  return omitBy(
    {
      dataElements,
      dataGroups,
      aggregations,
      startDate,
      endDate,
    },
    isNil,
  );
};
