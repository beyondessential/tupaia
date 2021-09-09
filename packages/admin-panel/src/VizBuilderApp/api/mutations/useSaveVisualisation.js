/*
 * Tupaia
 * Copyright (c) 2017 - 20211Beyond Essential Systems Pty Ltd
 *
 */
import { useMutation } from 'react-query';
import { post, put } from '../api';

export const useSaveVisualisation = config =>
  useMutation(
    ['dashboardVisualisation', config],
    () => {
      if (config.id) {
        return put(`dashboardVisualisation/${config.id}`, {
          data: { visualisation: config },
        });
      }
      return post('dashboardVisualisation', {
        data: { visualisation: config },
      });
    },
    {
      throwOnError: true,
    },
  );
