/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { post } from '../api';
import { setTaskFilterSetting } from '../../utils';

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation('logout', () => post('logout'), {
    onSuccess: () => {
      queryClient.invalidateQueries();
      setTaskFilterSetting('all_assignees_tasks', false);
      setTaskFilterSetting('show_completed_tasks', false);
      setTaskFilterSetting('show_cancelled_tasks', false);
    },
  });
};
