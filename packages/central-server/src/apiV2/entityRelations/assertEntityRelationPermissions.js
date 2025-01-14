import { RECORDS } from '@tupaia/database';
import { hasBESAdminAccess } from '../../permissions';
import { mergeFilter, mergeMultiJoin } from '../utilities';

export const assertEntityRelationPermissions = async (accessPolicy, models, entityRelationId) => {
  const entityRelation = await models.entityRelation.findById(entityRelationId);
  if (!entityRelation) {
    throw new Error(`No entity relation exists with id ${entityRelationId}`);
  }

  const child = await models.entity.findById(entityRelation.child_id);
  if (!accessPolicy.allows(child.country_code)) {
    throw new Error('You do not have permissions for this entity relation');
  }

  return true;
};

export const createEntityRelationDbFilter = (accessPolicy, criteria, options) => {
  const dbConditions = { ...criteria };
  const dbOptions = { ...options };

  if (!hasBESAdminAccess(accessPolicy)) {
    // Our permissions check logic is simplified based on the following assumptions:
    // 1. Each child is associated to a non-empty subset of its parent's countries
    // 2. Projects cannot be children of other entities
    //
    // All valid relations should satisfy the above invariants.
    // Note that invalid relations can expose parents that the user doesn't have permissions to,
    // e.g. entityInCountryA -> countryB, where the user only has permissions to countryB
    dbConditions['child.country_code'] = mergeFilter(
      accessPolicy.getEntitiesAllowed(),
      dbConditions['child.country_code'],
    );

    dbOptions.multiJoin = mergeMultiJoin(
      [
        {
          joinWith: RECORDS.ENTITY,
          joinAs: 'child',
          joinCondition: ['entity_relation.child_id', 'child.id'],
        },
      ],
      dbOptions.multiJoin,
    );
  }

  return { dbConditions, dbOptions };
};
