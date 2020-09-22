/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { groupBy } from 'lodash';

import { EntityModel as CommonEntityModel } from '@tupaia/database';

const addParentIdToEntity = (record, model) => {
  // the entity may have different parents in different hierarchies - find them all
  const allParentRelations = model.otherModels.ancestorDescendantRelation.find({
    descendant_id: record.id,
    generational_distance: 1,
  });

  // assume the "canonical" parent is the one that appears in the largest number of hierarchies
  const relationsByParentId = groupBy(allParentRelations, 'ancestor_id');
  const maxHierarchies = Math.max(Object.values(relationsByParentId).map(r => r.length));
  // it is possible that there are multiple parents in the same number of hierarchies, but just
  // take the first, ordered by the age of the parent record (i.e. its id)
  const canonicalParentId = Object.keys(relationsByParentId)
    .sort()
    .find(id => relationsByParentId[id].length === maxHierarchies);
  return { ...record, parent_id: canonicalParentId };
};

export class EntityModel extends CommonEntityModel {
  meditrakConfig = {
    ignorableFields: ['region', 'bounds'],
    minAppVersion: '1.7.102',
    transforms: [addParentIdToEntity],
  };
}
