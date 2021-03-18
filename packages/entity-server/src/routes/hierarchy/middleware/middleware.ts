/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { NextFunction, Response } from 'express';
import { PermissionsError } from '@tupaia/utils';
import { EntityType } from '../../../models';
import { HierarchyRequest } from '../types';
import { extractFieldsFromQuery, mapEntityToFields, mapEntitiesToFields } from './fields';

const notNull = <T>(value: T): value is Exclude<T, null> => value !== null;

const throwNoAccessError = (hierarchyName: string, entityCode: string) => {
  throw new PermissionsError(
    `No access to requested entity: ${entityCode} in hierarchy: ${hierarchyName}`,
  );
};

export const attachContext = async (req: HierarchyRequest, res: Response, next: NextFunction) => {
  try {
    const { entityCode, hierarchyName } = req.params;

    const hierarchy = await req.models.entityHierarchy.findOne({ name: hierarchyName });
    const entity = await req.models.entity.findOne({ code: entityCode });
    if (!hierarchy || !entity) {
      throwNoAccessError(hierarchyName, entityCode);
    }

    const rootEntity = entity.isProject()
      ? entity
      : await req.models.entity.findOne({ code: hierarchy.name });

    const allowedCountries = (await rootEntity.getChildren(hierarchy.id))
      .filter(e => req.accessPolicy.allows(e.country_code || undefined))
      .map(e => e.country_code)
      .filter(notNull);

    if (allowedCountries.length < 1) {
      throwNoAccessError(hierarchyName, entityCode);
    }

    if (
      !entity.isProject() &&
      (!notNull(entity.country_code) || !allowedCountries.includes(entity.country_code))
    ) {
      throwNoAccessError(hierarchyName, entityCode);
    }

    req.context.entity = entity;
    req.context.hierarchyId = hierarchy.id;
    req.context.allowedCountries = allowedCountries;
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
