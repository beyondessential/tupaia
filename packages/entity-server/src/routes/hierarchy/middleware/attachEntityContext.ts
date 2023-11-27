/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { Request, NextFunction, Response } from 'express';
import { PermissionsError } from '@tupaia/utils';
import { ajvValidate } from '@tupaia/tsutils';
import { EntityType, EntityFilter } from '../../../models';
import { extractFilterFromQuery } from './filter';
import { MultiEntityRequestBody, MultiEntityRequestBodySchema } from '../types';

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

  const { allowedCountries, filter } = await getFilterInfo(req, rootEntity);

  if (allowedCountries.length < 1) {
    throwNoAccessError(entityCodes);
  }

  const allowedEntities = entities.filter(entity =>
    userCanAccessEntity(entity, allowedCountries, rootEntity),
  );
  if (allowedEntities.length < 1) {
    throwNoAccessError(entityCodes);
  }

  return { entities: allowedEntities, allowedCountries, filter };
};

const getFilterInfo = async (
  req: Request<{ hierarchyName: string }, any, any, { filter?: string; isPublic?: string }>,
  rootEntity: EntityType,
) => {
  const isPublic = req.query.isPublic?.toLowerCase() === 'true';

  let allowedCountries = (await rootEntity.getChildren(req.ctx.hierarchyId))
    .map(child => child.country_code)
    .filter(notNull)
    .filter((countryCode, index, countryCodes) => countryCodes.indexOf(countryCode) === index); // De-duplicate countryCodes

  if (!isPublic) {
    const { permission_groups: projectPermissionGroups } = await req.models.project.findOne({
      code: req.params.hierarchyName,
    });

    // Fetch all country codes we have any of the project permission groups access to
    const projectAccessibleCountries: string[] = [];
    for (const permission of projectPermissionGroups) {
      projectAccessibleCountries.push(...req.accessPolicy.getEntitiesAllowed(permission));
    }
    allowedCountries = allowedCountries.filter(countryCode =>
      projectAccessibleCountries.includes(countryCode),
    );
  }

  const { filter: queryFilter } = req.query;
  const filter = extractFilterFromQuery(allowedCountries, queryFilter);

  return { allowedCountries, filter };
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
    const validatedBody = ajvValidate<MultiEntityRequestBody>(
      MultiEntityRequestBodySchema,
      req.body,
    );
    const { entities: entityCodes } = validatedBody;

    const context = await validateEntitiesAndBuildContext(req, entityCodes);

    req.ctx.entities = context.entities;
    req.ctx.allowedCountries = context.allowedCountries;
    req.ctx.filter = context.filter;

    next();
  } catch (error) {
    next(error);
  }
};

// Allows attaching the filter context without being directly under an entity context
// Currently this scenario is only used for EntitySearch
export const attachEntityFilterContext = async (
  req: Request<{ hierarchyName: string }, any, any, { filter?: string }> & {
    ctx: { allowedCountries: string[]; filter: EntityFilter };
  },
  res: Response,
  next: NextFunction,
) => {
  const rootEntity = await req.models.entity.findOne({
    type: 'project',
    code: req.params.hierarchyName,
  });

  const context = await getFilterInfo(req, rootEntity);

  req.ctx.allowedCountries = context.allowedCountries;
  req.ctx.filter = context.filter;

  next();
};
