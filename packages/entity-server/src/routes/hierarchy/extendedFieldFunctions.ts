/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { EntityRecord } from '@tupaia/server-boilerplate';
import { isNotNullish } from '@tupaia/tsutils';
import { calculateOuterBounds } from '@tupaia/utils';

const getParentCode = async (
  entity: EntityRecord,
  context: {
    hierarchyId: string;
  },
) => {
  const { hierarchyId } = context;
  return (await entity.getParent(hierarchyId))?.code;
};

const getChildrenCodes = async (
  entity: EntityRecord,
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

const getLocationType = (entity: EntityRecord) => {
  if (entity.region) return 'area';
  if (entity.point) return 'point';
  return 'no-coordinates';
};

const getParentName = async (
  entity: EntityRecord,
  context: {
    hierarchyId: string;
  },
) => {
  const { hierarchyId } = context;
  return (await entity.getParent(hierarchyId))?.name;
};

const getPoint = (entity: EntityRecord) => {
  return entity.getPoint();
};

const getRegion = (entity: EntityRecord) => {
  return entity.getRegion();
};

const getBounds = async (
  entity: EntityRecord,
  context: { hierarchyId: string; allowedCountries: string[] },
) => {
  if (entity.isProject()) {
    const { hierarchyId, allowedCountries } = context;
    const children = await entity.getChildren(hierarchyId, { country_code: allowedCountries });
    if (children.length > 0) {
      return calculateOuterBounds(children.map(child => child.bounds).filter(isNotNullish));
    }
  }

  return entity.getBounds();
};

const getQualifiedName = async (
  entity: EntityRecord,
  context: {
    hierarchyId: string;
  },
) => {
  // Qualified name is a comma separated list of the entity's parent tree
  const ancestors = await entity.getAncestors(context.hierarchyId);
  return [entity, ...ancestors]
    .filter(e => e.type !== 'project') // Don't include the project name
    .map(e => e.name)
    .join(', ');
};

export const extendedFieldFunctions = {
  parent_code: getParentCode,
  child_codes: getChildrenCodes,
  location_type: getLocationType,
  point: getPoint,
  region: getRegion,
  bounds: getBounds,
  qualified_name: getQualifiedName,
  parent_name: getParentName,
};

export const isExtendedField = (field: string): field is keyof typeof extendedFieldFunctions =>
  Object.keys(extendedFieldFunctions).includes(field);
