/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import { useMutation } from 'react-query';
import { post } from '../api';

export const useLikeDashboardItem = () =>
  useMutation(dashboardItemCode =>
    post('userFavouriteDashboardItem', {
      data: {
        changeType: 'create',
        dashboardItemCode,
      },
    }),
  );

export const useDislikeDashboardItem = () =>
  useMutation(dashboardItemCode =>
    post('userFavouriteDashboardItem', {
      data: {
        changeType: 'delete',
        dashboardItemCode,
      },
    }),
  );
