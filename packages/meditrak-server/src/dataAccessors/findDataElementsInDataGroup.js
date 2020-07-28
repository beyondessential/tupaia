/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';

export const findDataElementsInDataGroup = async (
  models,
  dataSourceId,
  criteria = {},
  options = {},
  findOrCount = 'find',
) => {
  return models.dataSource[findOrCount](
    { data_group_id: dataSourceId, ...criteria },
    {
      ...options,
      joinWith: TYPES.DATA_ELEMENT_DATA_GROUP,
      joinCondition: [
        `${TYPES.DATA_SOURCE}.id`,
        `${TYPES.DATA_ELEMENT_DATA_GROUP}.data_element_id`,
      ],
    },
  );
};
