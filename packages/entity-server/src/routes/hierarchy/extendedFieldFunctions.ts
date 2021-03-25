/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { EntityType } from '../../models';

const getParentCode = async (
  entity: EntityType,
  context: {
    hierarchyId: string;
  },
) => {
  const { hierarchyId } = context;
  return (await entity.getParent(hierarchyId))?.code;
};

const getChildrenCodes = async (
  entity: EntityType,
  context: {
    hierarchyId: string;
  },
) => {
  const { hierarchyId } = context;
  return (await entity.getChildren(hierarchyId)).map(child => child.code);
};

export const extendedFieldFunctions = {
  parent_code: getParentCode,
  child_codes: getChildrenCodes,
};
