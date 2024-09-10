/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '../api';

const updateExistingDashboardData = async (queryClient, { entityCode }) => {
  return queryClient.refetchQueries(['dashboard', entityCode]);
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
      onSuccess: async (data, variables) => {
        return updateExistingDashboardData(queryClient, variables);
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
      onSuccess: async (data, variables) => {
        return updateExistingDashboardData(queryClient, variables);
      },
    },
  );

export const useUpdateFavouriteDashboardItem = () => {
  const queryClient = useQueryClient();
  const favouriteMutation = useFavouriteDashboardItem(queryClient);
  const unfavouriteMutation = useUnfavouriteDashboardItem(queryClient);

  const mutate = ({ newFavouriteStatus, dashboardItemCode, entityCode }) => {
    const mutation = newFavouriteStatus ? favouriteMutation : unfavouriteMutation;
    mutation.mutate({ dashboardItemCode, entityCode });
  };

  return mutate;
};
