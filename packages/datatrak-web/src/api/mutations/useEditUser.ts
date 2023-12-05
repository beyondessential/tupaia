/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { UserAccountDetails } from '../../types';
import { put } from '../api';

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

  return useMutation<any, Error, UserAccountDetails, unknown>(
    async (userDetails: UserAccountDetails) => {
      if (!userDetails) return;

      // mobile_number field in database is nullable; don't just store an empty string
      if (!userDetails?.mobileNumber) {
        userDetails.mobileNumber = null;
      }

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
