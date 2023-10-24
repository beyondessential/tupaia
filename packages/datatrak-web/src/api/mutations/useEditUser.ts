/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { Project } from '@tupaia/types';
import { put } from '../api';
import { Entity } from '../../types';

type UserPreferences = { projectId?: Project['id']; countryId?: Entity['id'] };

export const useEditUser = onSuccess => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, UserPreferences, unknown>(
    async ({ projectId, countryId }: UserPreferences) => {
      if (!projectId && !countryId) {
        return;
      }

      const updates = {} as {
        project_id?: Project['id'];
        country_id?: Entity['id'];
      };

      if (projectId) {
        updates.project_id = projectId;
      }

      if (countryId) {
        updates.country_id = countryId;
      }

      await put('me', {
        data: updates,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('getUser');
        onSuccess();
      },
    },
  );
};
