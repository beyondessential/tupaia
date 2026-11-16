import { EntityRecord } from '@tupaia/tsmodels';

const getParentName = async (
  entity: EntityRecord,
  context: {
    projectId: string;
  },
) => {
  const { projectId } = context;
  const parent = await entity.getParentFromParentChildRelation(projectId);
  return parent?.name;
};

const getParentCode = async (
  entity: EntityRecord,
  context: {
    projectId: string;
  },
) => {
  const { projectId } = context;
  const parent = await entity.getParentFromParentChildRelation(projectId);
  return parent?.code;
};

export const extendedFieldFunctions = {
  parent_name: getParentName,
  parent_code: getParentCode,
};

export const isExtendedField = (field: string): field is keyof typeof extendedFieldFunctions =>
  Object.keys(extendedFieldFunctions).includes(field);
