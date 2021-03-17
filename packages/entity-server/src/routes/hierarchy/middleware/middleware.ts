/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { NextFunction, Response } from 'express';
import { AccessPolicy } from '@tupaia/access-policy';
import { PermissionsError } from '@tupaia/utils';
import { EntityType, EntityHierarchyType } from '../../../models';
import { HierarchyRequest } from '../types';
import { extractFieldsFromQuery, mapEntityToFields, mapEntitiesToFields } from './fields';

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

export const attachContext = async (req: HierarchyRequest, res: Response, next: NextFunction) => {
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
    req.context.fields = extractFieldsFromQuery(req.query.fields);
    req.context.formatEntityForResponse = (entityToFormat: EntityType) => {
      return mapEntityToFields(req.context.fields)(entityToFormat, req.context);
    };
    req.context.formatEntitiesForResponse = (entitiesToFormat: EntityType[]) => {
      return mapEntitiesToFields(req, req.context.fields)(entitiesToFormat, req.context);
    };

    next();
  } catch (error) {
    next(error);
  }
};
