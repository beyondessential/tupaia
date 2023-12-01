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

export const useEditUser = (options?: {
  onMutate?: () => void;
  onSettled?: () => void;
  onSuccess?: () => void;
}) => {
  const { onMutate, onSettled, onSuccess } = options ?? {};
  const queryClient = useQueryClient();

  return useMutation<any, Error, UserAccountDetails, unknown>(
    async (userDetails: UserAccountDetails) => {
      if (!userDetails) return;

      const updates = Object.entries(userDetails).reduce(
        (obj, [key, value]) => ({ ...obj, [camelToSnakeCase(key)]: value }),
        {},
      );

      await put('me', { data: updates });
    },
    {
      onMutate: () => {
        if (onMutate) onMutate();
      },
      onSettled: () => {
        if (onSettled) onSettled();
      },
      onSuccess: () => {
        queryClient.invalidateQueries('getUser');
        if (onSuccess) onSuccess();
      },
    },
  );
};
