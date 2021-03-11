/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { NextFunction, Response } from 'express';
import { AccessPolicy } from '@tupaia/access-policy';
import { PermissionsError } from '@tupaia/utils';
import { EntityServerModelRegistry } from '../../types';
import { HierarchyRequest, HierarchyResponse } from './types';
import { EntityType, EntityFields, ProjectType } from '../../models';

export const attachEntityAndHierarchyToRequest = async (
  req: HierarchyRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { entityCode, projectCode } = req.params;

    const project = await req.models.project.findOne({ code: projectCode });
    if (!project || !(await userHasAccessToProject(req.models, project, req.accessPolicy))) {
      throw new PermissionsError(`No access to requested project: ${projectCode}`);
    }

    const entity = await req.models.entity.findOne({ code: entityCode });
    if (!entity || !(await userHasAccessToEntity(entity, req.accessPolicy))) {
      throw new PermissionsError(`No access to requested entity: ${entityCode}`);
    }

    req.context.entity = entity;
    req.context.entityHierarchyId = project.entity_hierarchy_id;

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

const userHasAccessToProject = async (
  models: EntityServerModelRegistry,
  project: ProjectType,
  accessPolicy: AccessPolicy,
) => {
  const projectEntity = await models.entity.findOne({ code: project.code });
  const projectChildren = await projectEntity.getChildrenViaHierarchy(project.entity_hierarchy_id);

  return accessPolicy.allowsSome(projectChildren.map(c => c.country_code));
};

const userHasAccessToEntity = async (entity: EntityType, accessPolicy: AccessPolicy) => {
  // Timor-Leste is temporarily turned off
  // Note: Remove this check as part of: https://github.com/beyondessential/tupaia-backlog/issues/2456
  if (entity.country_code === 'TL') {
    return false;
  }

  if (entity.isProject()) {
    return true; // Already checked this in userHasAccessToProject
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
