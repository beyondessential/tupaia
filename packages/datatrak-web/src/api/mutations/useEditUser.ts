import { useQueryClient } from '@tanstack/react-query';

import { ensure } from '@tupaia/tsutils';
import { snakeKeys } from '@tupaia/utils';
import { editUser } from '../../database';
import { useDatabaseContext } from '../../hooks/database';
import { DatatrakWebModelRegistry, UserAccountDetails } from '../../types';
import { put } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { useDatabaseMutation } from '../queries';

export type EditUserParams = {
  models: DatatrakWebModelRegistry;
  data: UserAccountDetails;
};

export const prepareUserDetails = (userDetails: UserAccountDetails) => {
  // `mobile_number` field in database is nullable; don't just store an empty string
  if (userDetails?.mobileNumber === '') userDetails.mobileNumber = null;
  return snakeKeys(userDetails);
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
