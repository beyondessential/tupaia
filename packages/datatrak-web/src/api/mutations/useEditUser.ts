import { useQueryClient } from '@tanstack/react-query';

import { ensure } from '@tupaia/tsutils';

import { useDatabaseContext } from '../../hooks/database';
import { DatatrakWebModelRegistry, UserAccountDetails } from '../../types';
import { put } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { useDatabaseMutation } from '../queries';
import { editUser } from '../../database';

export type EditUserParams = {
  models: DatatrakWebModelRegistry;
  data: UserAccountDetails;
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

export const prepareUserDetails = (userDetails: UserAccountDetails) => {
  // `mobile_number` field in database is nullable; don't just store an empty string
  if (!userDetails?.mobileNumber) {
    userDetails.mobileNumber = null;
  }

  return Object.fromEntries(
    Object.entries(userDetails).map(([key, value]) => [camelToSnakeCase(key), value]),
  );
};

const editUserOnline = async ({ data: userDetails }: { data: UserAccountDetails }) => {
  if (!userDetails) {
    return;
  }

  const updates = prepareUserDetails(userDetails);

  return await put('me', { data: updates });
};

export const useEditUser = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const isOfflineFirst = useIsOfflineFirst();
  const { models } = useDatabaseContext() || {};

  return useDatabaseMutation<any, Error, UserAccountDetails, unknown>(
    isOfflineFirst ? editUser : editUserOnline,
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(['getUser']);
        // If the user changes their project, we need to invalidate the entity descendants query so that recent entities are updated if they change back to the previous project without refreshing the page
        if (variables.projectId) {
          queryClient.invalidateQueries(['entityDescendants']);
          queryClient.invalidateQueries(['tasks']);

          if (isOfflineFirst) {
            ensure(models).localSystemFact.addProjectForSync(variables.projectId);
          }
        }
        onSuccess?.();
      },
    },
  );
};
