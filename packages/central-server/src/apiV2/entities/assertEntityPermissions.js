import { NotFoundError, PermissionsError } from '@tupaia/utils';

export const assertEntityPermissions = async (accessPolicy, models, entityId) => {
  const entity = await models.entity.findById(entityId);
  if (!entity) {
    throw new NotFoundError(`No entity exists with ID ${entityId}`);
  }
  if (!accessPolicy.allows(entity.country_code)) {
    throw new PermissionsError('You do not have permissions for this entity');
  }
  return true;
};
