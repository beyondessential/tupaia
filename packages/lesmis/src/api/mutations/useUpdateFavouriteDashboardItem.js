/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import { useMutation } from 'react-query';

import { post } from '../api';

const useFavouriteDashboardItem = () =>
  useMutation(dashboardItemCode =>
    post('userFavouriteDashboardItems', {
      data: {
        state: 'favourite',
        dashboardItemCode,
      },
    }),
  );

const useUnfavouriteDashboardItem = () =>
  useMutation(dashboardItemCode =>
    post('userFavouriteDashboardItems', {
      data: {
        state: 'unfavourite',
        dashboardItemCode,
      },
    }),
  );

export const useUpdateFavouriteDashboardItem = () => {
  const favouriteMutation = useFavouriteDashboardItem();
  const unfavouriteMutation = useUnfavouriteDashboardItem();

  const mutate = (newFavouriteStatus, dashboardItemCode) => {
    const mutation = newFavouriteStatus ? favouriteMutation : unfavouriteMutation;
    mutation.mutate(dashboardItemCode);
  };

  return mutate;
};
