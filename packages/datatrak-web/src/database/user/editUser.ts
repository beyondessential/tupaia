import { SyncFact } from '@tupaia/constants';
import { ensure } from '@tupaia/tsutils';
import { EditUserParams, prepareUserDetails } from '../../api/mutations/useEditUser';

export const editUser = async ({ models, data: userDetails }: EditUserParams) => {
  if (!userDetails) {
    return;
  }

  const userId = ensure(
    await models.localSystemFact.get(SyncFact.CURRENT_USER_ID),
    'editUser mutation function called, but no user ID found',
  );

  let updates = prepareUserDetails(userDetails);
  updates = await models.user.getUpdatedUserPreferenceFields(userId, updates);

  await models.user.updateById(userId, updates);
};
