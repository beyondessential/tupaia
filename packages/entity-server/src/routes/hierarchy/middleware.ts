/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { NextFunction, Response } from 'express';
import { AccessPolicy } from '@tupaia/access-policy';
import { PermissionsError } from '@tupaia/utils';
import { HierarchyRequest, HierarchyResponse } from './types';
import { EntityType, EntityFields, EntityHierarchyType } from '../../models';

const userHasAccessToEntity = async (
  entity: EntityType,
  hierarchy: EntityHierarchyType,
  accessPolicy: AccessPolicy,
) => {
  // Timor-Leste is temporarily turned off
  // Note: Remove this check as part of: https://github.com/beyondessential/tupaia-backlog/issues/2456
  if (entity.country_code === 'TL') {
    return false;
  }

  if (entity.isProject()) {
    const projectChildren = await entity.getChildren(hierarchy.id); // User has project access if they have access to any children countries
    return accessPolicy.allowsSome(projectChildren.map(c => c.country_code));
  }

  return accessPolicy.allows(entity.country_code);
};

const mapEntityToFields = (fields: (keyof EntityFields)[]) => (entity: EntityType) => {
  const mappedEntity: { -readonly [field in keyof EntityFields]?: EntityFields[field] } = {};
  fields.forEach(field => {
    mappedEntity[field] = entity[field];
  });
  return mappedEntity;
};

const validFields: (keyof EntityFields)[] = ['code', 'country_code'];
const validateField = (field: string): field is keyof EntityFields => {
  return (validFields as string[]).includes(field);
};

const extractFieldsFromQuery = (queryFields?: string) => {
  if (!queryFields) {
    return validFields; // Display all fields if none specifically requested
  }

  const requestedFields = queryFields.split(',');
  const fields = new Set<keyof EntityFields>();
  requestedFields.forEach(requestedField => {
    if (validateField(requestedField)) {
      fields.add(requestedField);
    } else {
      throw new Error(`Unknown field requested: ${requestedField}`);
    }
  });
  return Array.from(fields);
};

export const attachEntityAndHierarchyToRequest = async (
  req: HierarchyRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { entityCode, hierarchyName } = req.params;

    const hierarchy = await req.models.entityHierarchy.findOne({ name: hierarchyName });
    const entity = await req.models.entity.findOne({ code: entityCode });
    if (
      !hierarchy ||
      !entity ||
      !(await userHasAccessToEntity(entity, hierarchy, req.accessPolicy))
    ) {
      throw new PermissionsError(`No access to requested entity: ${entityCode}`);
    }

    req.context.entity = entity;
    req.context.hierarchyId = hierarchy.id;

    next();
  } catch (error) {
    next(error);
  }
};

export const attachFormatterToResponse = async (
  req: HierarchyRequest,
  res: HierarchyResponse,
  next: NextFunction,
) => {
  try {
    res.context.formatEntityForResponse = mapEntityToFields(
      extractFieldsFromQuery(req.query.fields),
    );
    next();
  } catch (error) {
    next(error);
  }
};
