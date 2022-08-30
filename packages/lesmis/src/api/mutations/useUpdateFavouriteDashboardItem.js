/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import { useMutation } from 'react-query';
import { debounce } from '@tupaia/utils';

import { DISLIKE, LIKE } from '../../constants';
import { post } from '../api';

const useLikeDashboardItem = () =>
  useMutation(dashboardItemCode =>
    post('userFavouriteDashboardItem', {
      data: {
        changeType: 'create',
        dashboardItemCode,
      },
    }),
  );

const useDislikeDashboardItem = () =>
  useMutation(dashboardItemCode =>
    post('userFavouriteDashboardItem', {
      data: {
        changeType: 'delete',
        dashboardItemCode,
      },
    }),
  );

export const useUpdateFavouriteDashboardItem = () => {
  const likeMutation = useLikeDashboardItem();
  const dislikeMutation = useDislikeDashboardItem();

  const mutate = (newFavouriteStatus, dashboardItemCode) => {
    switch (newFavouriteStatus) {
      case LIKE:
        return likeMutation.mutate(dashboardItemCode);
      case DISLIKE:
        return dislikeMutation.mutate(dashboardItemCode);
      default:
        return null;
    }
  };

  const debounceMutate = debounce(
    (newFavouriteStatus, reportCode) => mutate(newFavouriteStatus, reportCode),
    1000,
  );

  return debounceMutate;
};
