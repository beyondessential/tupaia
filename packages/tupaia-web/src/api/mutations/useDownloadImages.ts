/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from '@tanstack/react-query';
import downloadJs from 'downloadjs';
import { get } from '../api';

export const useDownloadImages = dashboardItemCode => {
  return useMutation(
    ['downloadImages', dashboardItemCode],
    async () =>
      get('downloadImages', {
        responseType: 'blob',
        params: {
          dashboardItemCode,
        },
      }),
    {
      onSuccess: async (data: any) => {
        downloadJs(data);
      },
    },
  );
};
