import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useDatabaseContext } from '../../hooks/database';
import { UserAccountDetails } from '../../types';
import { put } from '../api';
import { useSyncContext } from '../SyncContext';

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
  const { models } = useDatabaseContext();

  return useMutation<any, Error, UserAccountDetails, unknown>(
    async (userDetails: UserAccountDetails) => {
      if (!userDetails) return;

      // `mobile_number` field in database is nullable; don't just store an empty string
      if (!userDetails?.mobileNumber) {
        userDetails.mobileNumber = null;
      }

      const updates = Object.fromEntries(
        Object.entries(userDetails).map(([key, value]) => [camelToSnakeCase(key), value]),
      );

      await put('me', { data: updates });
    },
    {
      onSuccess: async (_, variables) => {
        queryClient.invalidateQueries(['getUser']);
        // If the user changes their project, we need to invalidate the entity descendants query so that recent entities are updated if they change back to the previous project without refreshing the page
        if (variables.projectId) {
          queryClient.invalidateQueries(['entityDescendants']);
          queryClient.invalidateQueries(['tasks']);

          (async () => {
            await models.localSystemFact.addProjectForSync(variables.projectId);
          })();
        }
        onSuccess?.();
      },
    },
  );
};
