/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

const entityFindNameByCondition = async (models, condition) => {
  const entity = await models.entity.findOne(condition);
  const { name } = entity || {};
  return name || Object.values(condition)[0];
};

const orgUnitCodeToName = async (models, value) =>
  entityFindNameByCondition(models, { code: value });

const entityIdToName = async (models, value) => entityFindNameByCondition(models, { id: value });

const TRANSFORMATIONS = {
  orgUnitCodeToName,
  entityIdToName,
};

export const transformValue = async (models, transformationName, value) => {
  const transformation = TRANSFORMATIONS[transformationName];
  if (!transformation) {
    throw new Error(`Invalid transformation: ${transformationName}`);
  }

  return transformation(models, value);
};

export const transformObject = async (models, transformationName, object) => {
  const transformedObject = {};
  await Promise.all(
    Object.entries(object || {}).map(async ([key, value]) => {
      transformedObject[key] = await transformValue(models, transformationName, value);
    }),
  );

  return transformedObject;
};
