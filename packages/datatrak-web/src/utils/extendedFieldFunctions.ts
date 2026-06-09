import { EntityRecord } from '@tupaia/tsmodels';

const getParentName = async (
  entity: EntityRecord,
  context: {
    hierarchyId: string;
  },
) => {
  const { hierarchyId } = context;
  const parent = await entity.getParentFromParentChildRelation(hierarchyId);
  return parent?.name;
};

const getParentCode = async (
  entity: EntityRecord,
  context: {
    hierarchyId: string;
  },
) => {
  const { hierarchyId } = context;
  const parent = await entity.getParentFromParentChildRelation(hierarchyId);
  return parent?.code;
};

export const extendedFieldFunctions = {
  parent_name: getParentName,
  parent_code: getParentCode,
};

export const isExtendedField = (field: string): field is keyof typeof extendedFieldFunctions =>
  Object.keys(extendedFieldFunctions).includes(field);
