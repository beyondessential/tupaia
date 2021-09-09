/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { calculateOuterBounds } from '@tupaia/utils';
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

const getLocationType = (entity: EntityType) => {
  if (entity.region) return 'area';
  if (entity.point) return 'point';
  return 'no-coordinates';
};

const getPoint = (entity: EntityType) => {
  return entity.getPoint();
};

const getRegion = (entity: EntityType) => {
  return entity.getRegion();
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

  return entity.getBounds();
};

export const extendedFieldFunctions = {
  parent_code: getParentCode,
  child_codes: getChildrenCodes,
  location_type: getLocationType,
  point: getPoint,
  region: getRegion,
  bounds: getBounds,
};

export const isExtendedField = (field: string): field is keyof typeof extendedFieldFunctions =>
  Object.keys(extendedFieldFunctions).includes(field);
