import { NextFunction, Request, Response } from 'express';

import { EntityFilter, EntityRecord, extractEntityFilterFromQuery } from '@tupaia/tsmodels';
import { ajvValidate, isNotNullish } from '@tupaia/tsutils';
import { Entity } from '@tupaia/types';
import { PermissionsError } from '@tupaia/utils';
import { EntityServerModelRegistry } from '../../../types';
import { MultiEntityRequestBody, MultiEntityRequestBodySchema } from '../types';

const throwNoAccessError = (entityCodes: string[]) => {
  throw new PermissionsError(`No access to requested entities: ${entityCodes}`);
};

// A project's hierarchy root is no longer a stored `type = 'project'` entity — it is
// synthesized from the project record. Its id is the project id, which the hierarchy
// edges/closure use as the ancestor of the project's countries.
const getProjectRootEntity = async (
  models: EntityServerModelRegistry,
  hierarchyName: string,
): Promise<EntityRecord> => {
  const project = await models.project.findOne({ code: hierarchyName });
  if (!project) {
    throw new PermissionsError(`Cannot find root entity for hierarchy: ${hierarchyName}`);
  }
  return project.getRootEntity();
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
  if (entityCodes.length === 0) {
    // No entities requested
    return { entities: [], allowedCountries: [] };
  }

  const { projectId } = req.ctx;
  const { hierarchyName } = req.params;
  const rootEntity = await getProjectRootEntity(req.models, hierarchyName);

  const entities = await rootEntity.getDescendants(projectId, {
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

  const countryEntities = await rootEntity.getChildren(req.ctx.projectId);
  const childCodes = countryEntities.map(child => child.country_code).filter(isNotNullish);
  let allowedCountries = [...new Set(childCodes)];

  if (!isPublic) {
    const { permission_groups: projectPermissionGroups } = await req.models.project.findOneOrThrow(
      { code: req.params.hierarchyName },
      { columns: ['permission_groups'] },
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
  const rootEntity = await getProjectRootEntity(req.models, req.params.hierarchyName);

  const context = await getFilterInfo(req, rootEntity);

  req.ctx.allowedCountries = context.allowedCountries;
  req.ctx.filter = context.filter;

  next();
};
