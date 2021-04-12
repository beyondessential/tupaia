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

const throwNoAccessError = (entityCodeOrCodes: string | string[]) => {
  throw new PermissionsError(`No access to requested entity: ${entityCodeOrCodes}`);
};

const getAllowedCountries = async (
  req: SingleEntityRequest | MultiEntityRequest,
  rootEntity: EntityType,
) =>
  (await rootEntity.getChildren(req.ctx.hierarchyId))
    .map(child => child.country_code)
    .filter(notNull)
    .filter((countryCode, index, countryCodes) => countryCodes.indexOf(countryCode) === index) // De-duplicate countryCodes
    .filter(countryCode => req.accessPolicy.allows(countryCode));

const userCanAccessEntity = (entity: EntityType, allowedCountries: string[]) =>
  entity.isProject() ||
  (notNull(entity.country_code) && allowedCountries.includes(entity.country_code));

export const attachSingleEntityContext = async (
  req: SingleEntityRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { entityCode } = req.params;

    const entity = await req.models.entity.findOne({ code: entityCode });
    if (!entity) {
      throwNoAccessError(entityCode);
    }

    const { hierarchyId } = req.ctx;
    // Root type shouldn't be locked into being a project entity, see: https://github.com/beyondessential/tupaia-backlog/issues/2570
    const rootEntity = await entity.getAncestorOfType(hierarchyId, 'project');

    const allowedCountries = await getAllowedCountries(req, rootEntity);

    if (allowedCountries.length < 1) {
      throwNoAccessError(entityCode);
    }

    if (!userCanAccessEntity(entity, allowedCountries)) {
      throwNoAccessError(entityCode);
    }

    req.ctx.entity = entity;
    req.ctx.allowedCountries = allowedCountries;

    const { filter } = req.query;
    req.ctx.filter = extractFilterFromQuery(allowedCountries, filter);

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

    const entities = await req.models.entity.find({ code: entityCodes });
    if (!entities || entities.length === 0) {
      throwNoAccessError(entityCodes);
    }

    const { hierarchyId } = req.ctx;
    const rootEntity = await entities[0].getAncestorOfType(hierarchyId, 'project'); // Assuming all requested entities are in same hierarchy

    const allowedCountries = await getAllowedCountries(req, rootEntity);

    if (allowedCountries.length < 1) {
      throwNoAccessError(entityCodes);
    }

    if (!entities.every(entity => userCanAccessEntity(entity, allowedCountries))) {
      throwNoAccessError(entityCodes);
    }

    req.ctx.entities = entities;
    req.ctx.allowedCountries = allowedCountries;

    const { filter } = req.query;
    req.ctx.filter = extractFilterFromQuery(allowedCountries, filter);

    next();
  } catch (error) {
    next(error);
  }
};
