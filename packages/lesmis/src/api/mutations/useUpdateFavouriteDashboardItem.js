/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import { useMutation, useQueryClient } from 'react-query';
import { post } from '../api';

// Instead of refetching dashboard for 'isFavourite' config update, we update the current existing dashboard data.
const updateExistingDashboardData = (
  queryClient,
  { dashboardItemCode, newFavouriteStatus, entityCode, dashboardCode },
) => {
  const currentDashboardData = queryClient.getQueryData(['dashboard', entityCode]);
  const dashboardIndex = currentDashboardData.findIndex(
    dashboard => dashboard.dashboardCode === dashboardCode,
  );
  if (dashboardIndex < 0) {
    return;
  }

  const dashboardItemIndex = currentDashboardData[dashboardIndex].items.findIndex(
    item => item.code === dashboardItemCode,
  );
  if (dashboardItemIndex < 0) {
    return;
  }

  currentDashboardData[dashboardIndex].items[dashboardItemIndex].isFavourite = newFavouriteStatus;

  queryClient.setQueryData(['dashboard', entityCode], currentDashboardData);
};

const useFavouriteDashboardItem = queryClient => {
  return useMutation(
    ({ dashboardItemCode }) =>
      post('userFavouriteDashboardItems', {
        data: {
          state: 'favourite',
          dashboardItemCode,
        },
      }),
    {
      onSuccess: (data, variables) => {
        updateExistingDashboardData(queryClient, variables);
      },
    },
  );
};

const useUnfavouriteDashboardItem = queryClient =>
  useMutation(
    ({ dashboardItemCode }) =>
      post('userFavouriteDashboardItems', {
        data: {
          state: 'unfavourite',
          dashboardItemCode,
        },
      }),
    {
      onSuccess: (data, variables) => {
        updateExistingDashboardData(queryClient, variables);
      },
    },
  );

export const useUpdateFavouriteDashboardItem = () => {
  const queryClient = useQueryClient();
  const favouriteMutation = useFavouriteDashboardItem(queryClient);
  const unfavouriteMutation = useUnfavouriteDashboardItem(queryClient);

  const mutate = (newFavouriteStatus, dashboardItemCode, dashboardCode, entityCode) => {
    const mutation = newFavouriteStatus ? favouriteMutation : unfavouriteMutation;
    mutation.mutate({ newFavouriteStatus, dashboardItemCode, dashboardCode, entityCode });
  };

  return mutate;
};
