/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { queryCache, useMutation } from 'react-query';
import { MIN_DATE, SYNDROMES } from '../../constants';
import { getPeriodByDate } from '../../utils';
import { useData } from './helpers';
import { put, remove } from '../api';

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

  return {
    ...query,
    data,
  };
};

export const useArchiveAlert = alertId =>
  useMutation(() => put(`alerts/${alertId}/archive`), {
    onSuccess: () => {
      queryCache.invalidateQueries(`alerts/active`);
      queryCache.invalidateQueries(`alerts/archive`);
    },
    throwOnError: true,
  });

export const useRestoreArchivedAlert = alertId =>
  useMutation(() => put(`alerts/${alertId}/unarchive`), {
    onSuccess: () => {
      queryCache.invalidateQueries(`alerts/active`);
      queryCache.invalidateQueries(`alerts/archive`);
    },
    throwOnError: true,
  });

export const useDeleteAlert = alertId =>
  useMutation(() => remove(`alerts/${alertId}`), {
    onSuccess: () => {
      queryCache.invalidateQueries(`alerts/archive`);
    },
    throwOnError: true,
  });
