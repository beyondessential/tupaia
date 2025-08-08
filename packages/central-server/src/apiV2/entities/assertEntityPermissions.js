import { ensure } from '@tupaia/tsutils';
import { PermissionsError } from '@tupaia/utils';

export const assertEntityPermissions = async (accessPolicy, models, entityId) => {
  const entity = ensure(
    await models.entity.findById(entityId),
    `No entity exists with ID ${entityId}`,
  );
  if (!accessPolicy.allows(entity.country_code)) {
    throw new PermissionsError('You do not have permissions for this entity');
  }
  return true;
};
