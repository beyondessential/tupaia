import { orderBy } from 'es-toolkit/compat';
import { useQueryClient, useMutation } from '@tanstack/react-query';
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

export const useArchiveAlert = alertId => {
  const queryClient = useQueryClient();
  return useMutation(() => put(`alerts/${alertId}/archive`), {
    onSuccess: () => {
      queryClient.invalidateQueries([`alerts/active`]);
      queryClient.invalidateQueries([`alerts/archive`]);
    },
    throwOnError: true,
  });
};

export const useRestoreArchivedAlert = alertId => {
  const queryClient = useQueryClient();
  return useMutation(() => put(`alerts/${alertId}/unarchive`), {
    onSuccess: () => {
      queryClient.invalidateQueries([`alerts/active`]);
      queryClient.invalidateQueries([`alerts/archive`]);
    },
    throwOnError: true,
  });
};

export const useDeleteAlert = alertId => {
  const queryClient = useQueryClient();
  return useMutation(() => remove(`alerts/${alertId}`), {
    onSuccess: () => {
      queryClient.invalidateQueries([`alerts/archive`]);
    },
    throwOnError: true,
  });
};
