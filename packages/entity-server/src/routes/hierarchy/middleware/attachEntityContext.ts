import { NextFunction, Request, Response } from 'express';

import { EntityFilter, EntityRecord, extractEntityFilterFromQuery } from '@tupaia/tsmodels';
import { ajvValidate, isNotNullish } from '@tupaia/tsutils';
import { Entity, EntityTypeEnum } from '@tupaia/types';
import { PermissionsError } from '@tupaia/utils';

import { ensure } from '@tupaia/tsutils';
import { MultiEntityRequestBody, MultiEntityRequestBodySchema } from '../types';

const throwNoAccessError = (entityCodes: string[]) => {
  throw new PermissionsError(`No access to requested entities: ${entityCodes}`);
};

const userCanAccessEntity = (
  entity: EntityRecord,
  allowedCountries: string[],
  rootEntity: EntityRecord,
) =>
  (entity.isProject() && entity.code === rootEntity.code) ||
  (isNotNullish(entity.country_code) && allowedCountries.includes(entity.country_code));

const validateEntitiesAndBuildContext = async (
  req: Request<{ hierarchyName: string }, any, any, { filter?: string }>,
  entityCodes: string[],
) => {
  const { hierarchyId } = req.ctx;
  const { hierarchyName } = req.params;
  // Root type shouldn't be locked into being a project entity, see: https://github.com/beyondessential/tupaia-backlog/issues/2570
  const rootEntity = await req.models.entity.findOne({
    type: EntityTypeEnum.project,
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
  rootEntity: EntityRecord,
) => {
  const isPublic = req.query.isPublic?.toLowerCase() === 'true';

  const countryEntities = await rootEntity.getChildren(req.ctx.hierarchyId);
  const childCodes = countryEntities.map(child => child.country_code).filter(isNotNullish);
  let allowedCountries = [...new Set(childCodes)];

  if (!isPublic) {
    const { permission_groups: projectPermissionGroups } = ensure(
      await req.models.project.findOne({ code: req.params.hierarchyName }),
      `No project exists with code ${req.params.hierarchyName}`,
    );

    // Fetch all country codes we have any of the project permission groups access to
    const projectAccessibleCountries = new Set<Entity['code']>(
      projectPermissionGroups.flatMap(pg => req.accessPolicy.getEntitiesAllowed(pg)),
    );
    allowedCountries = allowedCountries.filter(c => projectAccessibleCountries.has(c));
  }

  const { filter: queryFilter } = req.query;
  const filter = extractEntityFilterFromQuery(allowedCountries, queryFilter);

  return { allowedCountries, filter };
};

export const attachSingleEntityContext = async (
  req: Request<{ hierarchyName: string; entityCode: string }, any, any, { filter?: string }> & {
    ctx: { entities: EntityRecord[]; allowedCountries: string[]; filter: EntityFilter };
  },
  _res: Response,
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
    ctx: { entities: EntityRecord[]; allowedCountries: string[]; filter: EntityFilter };
  },
  _res: Response,
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
  _res: Response,
  next: NextFunction,
) => {
  const rootEntity = await req.models.entity.findOne({
    type: EntityTypeEnum.project,
    code: req.params.hierarchyName,
  });

  const context = await getFilterInfo(req, rootEntity);

  req.ctx.allowedCountries = context.allowedCountries;
  req.ctx.filter = context.filter;

  next();
};
