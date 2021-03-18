/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  translatePoint,
  translateRegion,
  translateBounds,
  calculateOuterBounds,
} from '@tupaia/utils';
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
    allowedCountries: string[];
  },
) => {
  const { hierarchyId, allowedCountries } = context;
  return (await entity.getChildren(hierarchyId, { country_code: allowedCountries })).map(
    child => child.code,
  );
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

const getLocationType = (entity: EntityType) => {
  if (entity.region) return 'area';
  if (entity.point) return 'point';
  return 'no-coordinates';
};

const getPoint = (entity: EntityType) => {
  return translatePoint(entity.point);
};

const getRegion = (entity: EntityType) => {
  return translateRegion(entity.region);
};

const getBounds = async (
  entity: EntityType,
  context: { hierarchyId: string; allowedCountries: string[] },
) => {
  if (entity.isProject()) {
    const { hierarchyId, allowedCountries } = context;
    const children = await entity.getChildren(hierarchyId, { country_code: allowedCountries });
    if (children.length > 0) {
      return calculateOuterBounds(children.map(child => child.bounds));
    }
  }

  return translateBounds(entity.bounds);
};

export const extendedFieldFunctions = {
  parent_code: getParentCode,
  children_codes: getChildrenCodes,
  location_type: getLocationType,
  point: getPoint,
  region: getRegion,
  bounds: getBounds,
};
