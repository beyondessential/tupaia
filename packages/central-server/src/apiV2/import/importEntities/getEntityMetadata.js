export const getEntityMetadata = async (
  transactingModels,
  defaultMetadata,
  code,
  pushToDhis,
  projectId = null,
) => {
  const newDefaultMetadata = {
    ...defaultMetadata,
  };

  // Only assign push = false, by default all entities will be pushed to dhis
  if (!pushToDhis) {
    newDefaultMetadata.dhis.push = pushToDhis;
  }

  // TUP-3156 + TUP-3054: when projectId is plumbed through the import request,
  // this becomes project-scoped. Today projectId is null and findOneByCodeInProject
  // falls back to a bare findOne — same behaviour as before this change.
  const entity = await transactingModels.entity.findOneByCodeInProject(code, projectId);
  return entity && entity.metadata
    ? entity.metadata // we don't want to override the metadata if the entity already exists
    : newDefaultMetadata;
};
