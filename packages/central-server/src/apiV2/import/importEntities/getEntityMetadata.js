export const getEntityMetadata = async (transactingModels, defaultMetadata, code, pushToDhis) => {
  const newDefaultMetadata = {
    ...defaultMetadata,
  };

  // Only assign push = false, by default all entities will be pushed to dhis
  if (!pushToDhis) {
    newDefaultMetadata.dhis.push = pushToDhis;
  }

  const entity = await transactingModels.entity.findOne({ code });
  return entity && entity.metadata
    ? entity.metadata // we don't want to override the metadata if the entity already exists
    : newDefaultMetadata;
};
