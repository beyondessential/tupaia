/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { NextFunction, Response } from 'express';
import { PermissionsError } from '@tupaia/utils';
import { EntityType } from '../../../models';
import { SingleEntityRequest, MultiEntityRequest } from '../types';
import { extractFilterFromQuery } from './filter';

const notNull = <T>(value: T): value is Exclude<T, null> => value !== null;

const throwNoAccessError = (entityCodes: string[]) => {
  throw new PermissionsError(`No access to requested entities: ${entityCodes}`);
};

const userCanAccessEntity = (entity: EntityType, allowedCountries: string[]) =>
  entity.isProject() ||
  (notNull(entity.country_code) && allowedCountries.includes(entity.country_code));

const validateEntitiesAndBuildContext = async (
  req: SingleEntityRequest | MultiEntityRequest,
  entityCodes: string[],
) => {
  const entities = await req.models.entity.find({ code: entityCodes });
  if (!entities || entities.length === 0) {
    throwNoAccessError(entityCodes);
  }

  const { hierarchyId } = req.ctx;
  // Root type shouldn't be locked into being a project entity, see: https://github.com/beyondessential/tupaia-backlog/issues/2570
  const hierarchyRootEntity = await entities[0].getAncestorOfType(hierarchyId, 'project'); // Assuming all requested entities are in same hierarchy

  const allowedCountries = (await hierarchyRootEntity.getChildren(req.ctx.hierarchyId))
    .map(child => child.country_code)
    .filter(notNull)
    .filter((countryCode, index, countryCodes) => countryCodes.indexOf(countryCode) === index) // De-duplicate countryCodes
    .filter(countryCode => req.accessPolicy.allows(countryCode));

  if (allowedCountries.length < 1) {
    throwNoAccessError(entityCodes);
  }

  if (!entities.every(entity => userCanAccessEntity(entity, allowedCountries))) {
    throwNoAccessError(entityCodes);
  }

  const { filter: queryFilter } = req.query;
  const filter = extractFilterFromQuery(allowedCountries, queryFilter);
  return { hierarchyRootEntity, entities, allowedCountries, filter };
};

export const attachSingleEntityContext = async (
  req: SingleEntityRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { entityCode } = req.params;

    const context = await validateEntitiesAndBuildContext(req, [entityCode]);

    req.ctx.hierarchyRootEntity = context.hierarchyRootEntity;
    [req.ctx.entity] = context.entities;
    req.ctx.allowedCountries = context.allowedCountries;
    req.ctx.filter = context.filter;

    next();
  } catch (error) {
    next(error);
  }
};

export const attachMultiEntityContext = async (
  req: MultiEntityRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { entities: queryEntities } = req.query;
    if (!queryEntities) {
      throw new Error('Must provide entities=code1,code2,.. url parameter');
    }
    const entityCodes = queryEntities.split(',');

    const context = await validateEntitiesAndBuildContext(req, entityCodes);

    req.ctx.hierarchyRootEntity = context.hierarchyRootEntity;
    req.ctx.entities = context.entities;
    req.ctx.allowedCountries = context.allowedCountries;
    req.ctx.filter = context.filter;

    next();
  } catch (error) {
    next(error);
  }
};
