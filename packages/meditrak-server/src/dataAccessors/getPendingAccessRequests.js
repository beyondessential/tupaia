/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';
const { ACCESS_REQUEST, USER_ACCOUNT, COUNTRY } = TYPES;

export const getPendingAccessRequests = async (
  models,
  criteria,
  options = {},
  findOrCount = 'find',
) => {
  console.log('getPendingAccessRequests!!!!!');

  const findOnlyOptions =
    findOrCount === 'find'
      ? {
          ...options,
          columns: [
            { id: `${ACCESS_REQUEST}.id` },
            'message',
            'permission_group',
            { 'user.email': `${USER_ACCOUNT}.email` },
            { 'country.name': `${COUNTRY}.name` },
          ],
        }
      : {};

  return models.database[findOrCount](
    ACCESS_REQUEST,
    { approved: null },
    {
      ...findOnlyOptions,
      multiJoin: [
        {
          joinWith: USER_ACCOUNT,
          joinCondition: [`${ACCESS_REQUEST}.user_id`, `${USER_ACCOUNT}.id`],
        },
        {
          joinWith: COUNTRY,
          joinCondition: [`${ACCESS_REQUEST}.country_id`, `${COUNTRY}.id`],
        },
      ],
    },
  );
};
