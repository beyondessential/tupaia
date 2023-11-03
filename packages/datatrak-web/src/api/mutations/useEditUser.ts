/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { Project } from '@tupaia/types';
import { put } from '../api';
import { Entity } from '../../types';

type UserPreferences = {
  projectId?: Project['id'];
  countryId?: Entity['id'];
  deleteAccountRequested?: boolean;
};

export const useEditUser = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, UserPreferences, unknown>(
    async ({ projectId, countryId, deleteAccountRequested }: UserPreferences) => {
      if (!projectId && !countryId && deleteAccountRequested === undefined) {
        return;
      }

      const updates = {} as {
        project_id?: Project['id'];
        country_id?: Entity['id'];
        delete_account_requested?: boolean;
      };

      if (projectId) {
        updates.project_id = projectId;
      }

      if (countryId) {
        updates.country_id = countryId;
      }

      if (deleteAccountRequested) {
        updates.delete_account_requested = deleteAccountRequested;
      }
      await put('me', {
        data: updates,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('getUser');
        if (onSuccess) onSuccess();
      },
    },
  );
};
