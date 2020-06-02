/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/
import { DatabaseType, TYPES } from '@tupaia/database';
import { respond } from '@tupaia/utils';
const { ACCESS_REQUEST, USER_ACCOUNT, COUNTRY } = TYPES;

const getRecordData = async record => (record instanceof DatabaseType ? record.getData() : record);

export const getPendingAccessRequests = async (req, res) => {
  const { models } = req;

  const records = await models.database.find(
    ACCESS_REQUEST,
    { approved: null },
    {
      columns: [
        { id: `${ACCESS_REQUEST}.id` },
        'message',
        'permission_group',
        { 'user.email': `${USER_ACCOUNT}.email` },
        { 'country.name': `${COUNTRY}.name` },
      ],
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

  //const records = await models.accessRequest.find({ approved: null });
  const pendingAccessRequests = await Promise.all(records.map(getRecordData));

  console.log('PENDING', pendingAccessRequests);

  respond(res, pendingAccessRequests);
};

/*

return models.database[findOrCount](TYPES.QUESTION, criteria, {
  ...findOnlyOptions,
  multiJoin: [
    {
      joinWith: TYPES.SURVEY_SCREEN_COMPONENT,
      joinCondition: [`${TYPES.QUESTION}.id`, `${TYPES.SURVEY_SCREEN_COMPONENT}.question_id`],
    },
    {
      joinWith: TYPES.SURVEY_SCREEN,
      joinCondition: [`${TYPES.SURVEY_SCREEN}.id`, `${TYPES.SURVEY_SCREEN_COMPONENT}.screen_id`],
    },
  ],
});

*/
