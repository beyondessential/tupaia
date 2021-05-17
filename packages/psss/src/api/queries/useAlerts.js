/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { MIN_DATE, SYNDROMES } from '../../constants';
import { getPeriodByDate } from '../../utils';
import { useData } from './helpers';

export const useAlerts = (period, orgUnitCodes, alertCategory) => {
  const params = {
    startWeek: getPeriodByDate(MIN_DATE),
    endWeek: period,
    orgUnitCodes: orgUnitCodes.join(','),
  };

  const endpoint = `alerts/${alertCategory}`;
  const { data: alertData = [], ...query } = useData(endpoint, { params });
  const data = alertData.map(reportRow => ({
    ...reportRow,
    syndromeName: SYNDROMES[reportRow.syndrome.toUpperCase()],
  }));

  return {
    ...query,
    data,
  };
};
