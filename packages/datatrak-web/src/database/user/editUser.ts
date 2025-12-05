import { FACT_CURRENT_USER_ID } from '@tupaia/constants';
import { EditUserParams, prepareUserDetails } from '../../api/mutations/useEditUser';

export const editUser = async ({ models, data: userDetails }: EditUserParams) => {
  if (!userDetails) {
    return;
  }

  const userId = await models.localSystemFact.get(FACT_CURRENT_USER_ID);

  let updates = prepareUserDetails(userDetails);
  updates = await models.user.getUpdatedUserPreferenceFields(userId, updates);

  await models.user.updateById(userId, updates);
};
