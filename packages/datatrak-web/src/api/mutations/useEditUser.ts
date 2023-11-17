/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { Project } from '@tupaia/types';
import { put } from '../api';
import { Entity } from '../../types';

type UserDetails = {
  firstName?: string;
  lastName?: string;
  employer?: string;
  position?: string;
  mobileNumber?: string;

  // Preferences
  projectId?: Project['id'];
  countryId?: Entity['id'];
  deleteAccountRequested?: boolean;
};

/**
 * Converts a string from camel case to snake case.
 *
 * @remarks
 * Ignores whitespace characters, including wordspaces and newlines. Does not handle fully-
 * uppercase acronyms/initialisms. e.g. 'HTTPRequest' -> 'h_t_t_p_request'.
 */
function camelToSnakeCase(camelCaseString: string): string {
  return camelCaseString
    ?.split(/\.?(?=[A-Z])/)
    .join('_')
    .toLowerCase();
}

export const useEditUser = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, UserDetails, unknown>(
    async (userDetails: UserDetails) => {
      if (!userDetails) return;

      const updates = Object.entries(userDetails).reduce(
        (obj, [key, value]) => ({ ...obj, [camelToSnakeCase(key)]: value }),
        {},
      );

      await put('me', { data: updates });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('getUser');
        if (onSuccess) onSuccess();
      },
    },
  );
};
