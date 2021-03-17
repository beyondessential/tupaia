/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { EntityType } from '../../models';

const getParentCode = async (
  entity: EntityType,
  context: {
    hierarchyId: string;
  },
) => {
  const { hierarchyId } = context;
  return (await entity.getParent(hierarchyId))?.code;
};

/**
 * Faster than getParentCode() but requires pre-calculating the entityIdToCodeMap and childToParentMap
 * Use when performing getParentCode() for many entities
 */
export const getParentCodeBulk = (
  entity: EntityType,
  entityIdToCodeMap: Record<string, string>,
  childToParentMap: Record<string, string>,
) => {
  return entityIdToCodeMap[childToParentMap[entity.id]];
};

const getChildrenCodes = async (
  entity: EntityType,
  context: {
    hierarchyId: string;
  },
) => {
  const { hierarchyId } = context;
  return (await entity.getChildren(hierarchyId)).map(child => child.code);
};

/**
 * Faster than getChildrenCodes() but requires pre-calculating the entityIdToCodeMap and parentToChildrenMap
 * Use when performing getChildrenCodes() for many entities
 */
export const getChildrenCodesBulk = (
  entity: EntityType,
  entityIdToCodeMap: Record<string, string>,
  parentToChildrenMap: Record<string, string[]>,
) => {
  return parentToChildrenMap[entity.id]?.map(childId => entityIdToCodeMap[childId]);
};

export const extendedFieldFunctions = {
  parent_code: getParentCode,
  children_codes: getChildrenCodes,
};
