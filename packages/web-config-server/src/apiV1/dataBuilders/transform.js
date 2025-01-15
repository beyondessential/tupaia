const findEntityName = async (models, conditions) => {
  const entity = await models.entity.findOne(conditions);
  const { name } = entity || {};
  return name || Object.values(conditions)[0];
};

const orgUnitCodeToName = async (models, value) => findEntityName(models, { code: value });

const entityIdToName = async (models, value) => findEntityName(models, { id: value });

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
