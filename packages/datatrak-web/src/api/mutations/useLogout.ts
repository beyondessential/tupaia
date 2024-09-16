/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '../api';
import { removeTaskFilterSetting } from '../../utils';

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation(['logout'], () => post('logout'), {
    onSuccess: async () => {
      await queryClient.resetQueries();
      removeTaskFilterSetting('all_assignees_tasks');
      removeTaskFilterSetting('show_completed_tasks');
      removeTaskFilterSetting('show_cancelled_tasks');
    },
  });
};
