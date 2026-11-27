import { encryptPassword, generateSecretKey } from '@tupaia/auth';
import { UnexpectedNullishValueError } from '@tupaia/tsutils';
import { DatabaseError, UnprocessableContentError } from '@tupaia/utils';

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
      const [permissionGroup, country] = await Promise.all([
        transactingModels.permissionGroup.findOneOrThrow(
          { name: permissionGroupName },
          { columns: ['id'] },
          `No permission group found with name ‘${permissionGroupName}’`,
        ),
        transactingModels.entity.findOneOrThrow(
          { name: countryName, type: 'country' },
          { columns: ['id'] },
          `No country found with name ‘${countryName}’`,
        ),
      ]);

      const newPasswordHash = await encryptPassword(password);

      const user = await transactingModels.user.create({
        first_name: firstName,
        last_name: lastName,
        email: emailAddress,
        mobile_number: contactNumber,
        password_hash: newPasswordHash,
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
          secret_key_hash: await encryptPassword(secretKey),
        });
      }

      return { userId: user.id, secretKey };
    });
  } catch (error) {
    if (error instanceof UnexpectedNullishValueError) {
      throw new UnprocessableContentError(error.message);
    }
    throw new DatabaseError('creating user', error);
  }
};
