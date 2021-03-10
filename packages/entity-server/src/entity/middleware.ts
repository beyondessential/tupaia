/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { NextFunction, Response } from 'express';
import { AccessPolicy } from '@tupaia/access-policy';
import { PermissionsError } from '@tupaia/utils';
import { EntityModel, EntityFields, FetchEntityRequest, FetchEntityResponse } from '../types';

export const attachEntityToRequest = async (
  req: FetchEntityRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { entityCode, projectCode } = req.params;
    const entity = await req.models.entity.findOne({
      code: entityCode,
    });

    if (!entity || !(await userHasAccessToEntity(entity, projectCode, req.accessPolicy))) {
      throw new PermissionsError(`No access to requested entity: ${entityCode}`);
    }

    req.context.entity = entity;

    next();
  } catch (error) {
    next(error);
  }
};

export const attachFormatterToResponse = async (
  req: FetchEntityRequest,
  res: FetchEntityResponse,
  next: NextFunction,
) => {
  try {
    res.context.formatEntityForResponse = mapEntitiesToFields(
      extractFieldsFromQuery(req.query.fields),
    );
    next();
  } catch (error) {
    next(error);
  }
};

const userHasAccessToEntity = async (
  entity: EntityModel,
  projectCode: string,
  accessPolicy: AccessPolicy,
) => {
  // Assume user always has access to all world items.
  if (entity.code === 'World') {
    return true;
  }
  // Timor-Leste is temporarily turned off
  if (entity.country_code === 'TL') {
    return false;
  }

  // project access rights are determined by their children
  if (entity.isProject()) {
    const projectChildren = await entity.getChildren(projectCode);

    return accessPolicy.allowsSome(projectChildren.map(c => c.country_code));
  }

  return accessPolicy.allows(entity.country_code);
};

const mapEntitiesToFields = (fields: (keyof EntityFields)[]) => (model: EntityModel) => {
  const mappedEntity: { -readonly [field in keyof EntityFields]?: EntityFields[field] } = {};
  fields.forEach(field => {
    mappedEntity[field] = model[field];
  });
  return mappedEntity;
};

const validFields: (keyof EntityFields)[] = ['code', 'country_code'];
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

const validateField = (field: string): field is keyof EntityFields => {
  return (validFields as string[]).includes(field);
};
