/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SYNDROMES } from '../../constants';
import { useReport } from './helpers';

export const useActiveAlerts = (period, orgUnitCodes) => {
  const params = { startWeek: period, endWeek: period, orgUnitCodes: orgUnitCodes.join(',') };
  const query = useReport('activeAlertsReport', { params });
  const data = query.data.map(reportRow => ({
    ...reportRow,
    syndromeName: SYNDROMES[reportRow.syndrome.toUpperCase()],
  }));

  return { ...query, data };
};
