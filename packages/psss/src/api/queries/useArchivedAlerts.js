/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { MIN_DATE, SYNDROMES } from '../../constants';
import { getPeriodByDate } from '../../utils';
import { useReport } from './helpers';

export const useArchivedAlerts = orgUnitCodes => {
  const params = {
    startWeek: getPeriodByDate(MIN_DATE),
    endWeek: getPeriodByDate(new Date()),
    orgUnitCodes: orgUnitCodes.join(','),
  };
  const query = useReport('archivedAlertsReport', { params });
  const data = query.data.map(reportRow => ({
    ...reportRow,
    syndromeName: SYNDROMES[reportRow.syndrome.toUpperCase()],
  }));

  return {
    ...query,
    data,
  };
};
