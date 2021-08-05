/*
 * Tupaia
 * Copyright (c) 2017 - 20211Beyond Essential Systems Pty Ltd
 *
 */
import { useMutation } from 'react-query';
import { post } from '../api';

// Todo: Finish Save Button @see https://linear.app/tupaia/issue/MEL-20/save-button
export const useSaveVisualisation = config =>
  useMutation(
    ['saveDashboardVisualisation', config],
    () =>
      post('saveDashboardVisualisation', {
        data: { visualisation: config },
      }),
    {
      onSuccess: () => {
        console.log('save success');
      },
      throwOnError: true,
    },
  );
