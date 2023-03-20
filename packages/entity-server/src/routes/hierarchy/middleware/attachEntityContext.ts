/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { Request, NextFunction, Response } from 'express';
import { PermissionsError } from '@tupaia/utils';
import { EntityType, EntityFilter } from '../../../models';
import { extractFilterFromQuery } from './filter';
import { ajvValidate } from '@tupaia/tsutils';
import { MultiEntityRequestBodySchema } from '../types';

const notNull = <T>(value: T): value is Exclude<T, null> => value !== null;

const throwNoAccessError = (entityCodes: string[]) => {
  throw new PermissionsError(`No access to requested entities: ${entityCodes}`);
};

const userCanAccessEntity = (
  entity: EntityType,
  allowedCountries: string[],
  rootEntity: EntityType,
) =>
  (entity.isProject() && entity.code === rootEntity.code) ||
  (notNull(entity.country_code) && allowedCountries.includes(entity.country_code));

const validateEntitiesAndBuildContext = async (
  req: Request<{ hierarchyName: string }, any, any, { filter?: string }>,
  entityCodes: string[],
) => {
  const { hierarchyId } = req.ctx;
  const { hierarchyName } = req.params;
  // Root type shouldn't be locked into being a project entity, see: https://github.com/beyondessential/tupaia-backlog/issues/2570
  const rootEntity = await req.models.entity.findOne({
    type: 'project',
    code: hierarchyName,
  });
  if (!rootEntity) {
    throw new Error(`Cannot find root entity for hierarchy: ${req.params.hierarchyName}`);
  }

  if (entityCodes.length === 0) {
    // No entities requested
    return { entities: [], allowedCountries: [] };
  }

  const entities = await rootEntity.getDescendants(hierarchyId, {
    code: entityCodes,
  });

  // 'getDescendants' won't return root entity, so add here if requested
  if (entityCodes.includes(rootEntity.code)) {
    entities.push(rootEntity);
  }

  if (!entities || entities.length === 0) {
    throwNoAccessError(entityCodes);
  }
  const allowedCountries = (await rootEntity.getChildren(req.ctx.hierarchyId))
    .map(child => child.country_code)
    .filter(notNull)
    .filter((countryCode, index, countryCodes) => countryCodes.indexOf(countryCode) === index) // De-duplicate countryCodes
    .filter(countryCode => req.accessPolicy.allows(countryCode));

  if (allowedCountries.length < 1) {
    throwNoAccessError(entityCodes);
  }

  const allowedEntities = entities.filter(entity =>
    userCanAccessEntity(entity, allowedCountries, rootEntity),
  );
  if (allowedEntities.length < 1) {
    throwNoAccessError(entityCodes);
  }

  const { filter: queryFilter } = req.query;
  const filter = extractFilterFromQuery(allowedCountries, queryFilter);
  return { entities: allowedEntities, allowedCountries, filter };
};

export const attachSingleEntityContext = async (
  req: Request<{ hierarchyName: string; entityCode: string }, any, any, { filter?: string }> & {
    ctx: { entities: EntityType[]; allowedCountries: string[]; filter: EntityFilter };
  },
  res: Response,
  next: NextFunction,
) => {
  try {
    const { entityCode } = req.params;

    const context = await validateEntitiesAndBuildContext(req, [entityCode]);

    [req.ctx.entity] = context.entities;
    req.ctx.allowedCountries = context.allowedCountries;
    req.ctx.filter = context.filter;

    next();
  } catch (error) {
    next(error);
  }
};

export const attachMultiEntityContext = async (
  req: Request<{ hierarchyName: string }, any, { entities: string[] }, { filter?: string }> & {
    ctx: { entities: EntityType[]; allowedCountries: string[]; filter: EntityFilter };
  },
  res: Response,
  next: NextFunction,
) => {
  try {
    await ajvValidate(MultiEntityRequestBodySchema, req.body);
    const { entities: entityCodes } = req.body;

    const context = await validateEntitiesAndBuildContext(req, entityCodes);

    req.ctx.entities = context.entities;
    req.ctx.allowedCountries = context.allowedCountries;
    req.ctx.filter = context.filter;

    next();
  } catch (error) {
    next(error);
  }
};
