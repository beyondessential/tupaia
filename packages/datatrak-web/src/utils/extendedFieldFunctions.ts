import { EntityRecord } from '@tupaia/tsmodels';
import { FormatContext } from './formatEntity';

const getParentName = async (entity: EntityRecord, context: FormatContext) => {
  const { hierarchyId } = context;
  const parent = await entity.getParentFromParentChildRelation(hierarchyId);
  return parent?.name;
};

export const extendedFieldFunctions = {
  parent_name: getParentName,
};

export const isExtendedField = (field: string): field is keyof typeof extendedFieldFunctions =>
  Object.keys(extendedFieldFunctions).includes(field);
