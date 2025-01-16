import { DatabaseError } from '@tupaia/utils';
import { hashAndSaltPassword, encryptPassword, generateSecretKey } from '@tupaia/auth';

export const createUser = async (
  models,
  {
    firstName,
    lastName,
    emailAddress,
    contactNumber,
    password,
    countryName = 'Demo Land',
    permissionGroupName,
    is_api_client: isApiClient,
    verifiedEmail,
    ...restOfUser
  },
) => {
  try {
    return await models.wrapInTransaction(async transactingModels => {
      const permissionGroup = await transactingModels.permissionGroup.findOne({
        name: permissionGroupName,
      });
      const country = await transactingModels.entity.findOne({
        name: countryName,
        type: 'country',
      });

      if (!permissionGroup) {
        throw new Error(`No such permission group: ${permissionGroupName}`);
      }

      if (!country) {
        throw new Error(`No such country: ${countryName}`);
      }

      const user = await transactingModels.user.create({
        first_name: firstName,
        last_name: lastName,
        email: emailAddress,
        mobile_number: contactNumber,
        ...hashAndSaltPassword(password),
        verified_email: verifiedEmail,
        ...restOfUser,
      });

      await transactingModels.userEntityPermission.findOrCreate({
        user_id: user.id,
        entity_id: country.id,
        permission_group_id: permissionGroup.id,
      });

      let secretKey;
      if (isApiClient) {
        secretKey = await generateSecretKey();
        await transactingModels.apiClient.create({
          username: user.email,
          user_account_id: user.id,
          secret_key_hash: encryptPassword(secretKey, process.env.API_CLIENT_SALT),
        });
      }

      return { userId: user.id, secretKey };
    });
  } catch (error) {
    throw new DatabaseError('creating user', error);
  }
};
