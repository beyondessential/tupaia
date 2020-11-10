/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

const orgUnitCodeToName = async (models, value) => {
  const organisationUnit = await models.entity.findOne({ code: value });
  const { name } = organisationUnit || {};

  return name || value;
};

const TRANSFORMATIONS = {
  orgUnitCodeToName,
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
