/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { EntityServerModelRegistry } from '../../../types';
import { SingleEntityContext } from '../types';

export const getMatchingRelatives = async (
  models: EntityServerModelRegistry,
  ctx: SingleEntityContext,
) => {
  const { hierarchyId, entity, filter } = ctx;
  const matchingAncestors = (
    await entity.getAncestors(hierarchyId, {
      ...filter,
    })
  )
    .slice()
    .reverse(); // getAncestors() comes sorted closest -> furthest, we want furthest -> closest

  const matchingSelf = await models.entity.find({
    ...filter,
    code: entity.code, // Find an entity that matches the filter AND the base entity code
  });

  const matchingDescendants = await entity.getDescendants(hierarchyId, {
    ...filter,
  });

  return [...matchingAncestors, ...matchingSelf, ...matchingDescendants];
};
