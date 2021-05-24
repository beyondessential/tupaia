/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import orderBy from 'lodash.orderby';
import { MIN_DATE, SYNDROMES } from '../../constants';
import { getPeriodByDate } from '../../utils';
import { useData } from './helpers';

export const useAlerts = (period, orgUnitCodes, alertCategory) => {
  const params = {
    startWeek: getPeriodByDate(MIN_DATE),
    endWeek: period,
    orgUnitCodes: orgUnitCodes.join(','),
  };

  const { data: alertData = [], ...query } = useData(`alerts/${alertCategory}`, { params });
  const data = alertData.map(reportRow => ({
    ...reportRow,
    syndromeName: SYNDROMES[reportRow.syndrome.toUpperCase()],
  }));
  const sortedData = orderBy(
    data,
    ['organisationUnit', 'period', 'syndrome'],
    ['asc', 'desc', 'asc'],
  );

  return {
    ...query,
    data: sortedData,
  };
};
