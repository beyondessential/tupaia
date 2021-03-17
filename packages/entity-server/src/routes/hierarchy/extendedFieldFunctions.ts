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
 * Faster than getParentCode() but requires pre-calculating the childToParentMap
 * Use when performing getParentCode() for many entities
 */
export const getParentCodeBulk = (entity: EntityType, childToParentMap: Record<string, string>) => {
  return childToParentMap[entity.code];
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
 * Faster than getChildrenCodes() but requires pre-calculating the parentToChildrenMap
 * Use when performing getChildrenCodes() for many entities
 */
export const getChildrenCodesBulk = (
  entity: EntityType,
  parentToChildrenMap: Record<string, string[]>,
) => {
  return parentToChildrenMap[entity.code];
};

export const extendedFieldFunctions = {
  parent_code: getParentCode,
  children_codes: getChildrenCodes,
};
