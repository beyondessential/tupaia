export const getHierarchyByName = async (models, name) => {
  return await models.entityHierarchy.findOne({ name });
};

export const getEntityByCode = async (models, code) => {
  return await models.entity.findOne({ code });
};

export const removeEmptyFields = ({ model: _, ...entity }) => {
  return Object.fromEntries(Object.entries(entity).filter(([, value]) => value !== undefined));
};
