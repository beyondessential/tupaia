/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { put } from '../api';

type UserAccountDetails = Record<string, any>;

export const useEditUser = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, UserAccountDetails, unknown>(
    async (userDetails: Record<string, any>) => {
      const data = {
        project_id: userDetails.projectId,
      };
      await put('me', { data });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['getUser']);
        if (onSuccess) onSuccess();
      },
    },
  );
};
