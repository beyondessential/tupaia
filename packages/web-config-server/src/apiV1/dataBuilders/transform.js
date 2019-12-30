/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { Entity } from '/models';

const orgUnitCodeToName = async value => {
  const organisationUnit = await Entity.findOne({ code: value });
  const { name } = organisationUnit || {};

  return name || value;
};

const TRANSFORMATIONS = {
  orgUnitCodeToName,
};

export const transformValue = async (transformationName, value) => {
  const transformation = TRANSFORMATIONS[transformationName];
  if (!transformation) {
    throw new Error(`Invalid transformation: ${transformationName}`);
  }

  return transformation(value);
};

export const transformObject = async (transformationName, object) => {
  const transformedObject = {};
  await Promise.all(
    Object.entries(object || {}).map(async ([key, value]) => {
      transformedObject[key] = await transformValue(transformationName, value);
    }),
  );

  return transformedObject;
};
