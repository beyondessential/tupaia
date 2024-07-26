/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import {
  DatatrakWebSubmitSurveyResponseRequest,
  DatatrakWebSubmitSurveyResponseRequest as RequestT,
} from '@tupaia/types';
import { processSurveyResponse } from './processSurveyResponse';
import { addRecentEntities } from '../../utils';

export type SubmitSurveyResponseRequest = Request<
  RequestT.Params,
  RequestT.ResBody,
  RequestT.ReqBody,
  RequestT.ReqQuery
>;

const testData = {
  surveyId: '66a3025e24db841515000055',
  questions: [
    {
      id: '66a3026324db841515000056',
      componentNumber: 1,
      name: 'Select asset',
      type: 'PrimaryEntity',
      code: 'TEST_00',
      text: 'Select asset',
      label: null,
      options: [],
      optionSetId: null,
      detail: null,
      questionId: '66a3026324db841515000056',
      detailLabel: null,
      validationCriteria: { mandatory: true },
      visibilityCriteria: {},
      config: { entity: { createNew: false, filter: { type: ['village'] } } },
      componentId: '66a3026324db841515000058',
    },
    {
      id: '66a3026524db84151500005b',
      componentNumber: 2,
      name: 'Would you like to create a ASSET_REPAIR task for this asset?',
      type: 'Binary',
      code: 'TEST_01',
      text: 'Would you like to create a ASSET_REPAIR task for this asset?',
      label: null,
      options: [],
      optionSetId: null,
      detail: null,
      questionId: '66a3026524db84151500005b',
      detailLabel: null,
      validationCriteria: {},
      visibilityCriteria: {},
      config: {},
      componentId: '66a3026524db84151500005c',
    },
    {
      id: '66a3026524db84151500005f',
      componentNumber: 3,
      name: 'Due date of the task',
      type: 'Date',
      code: 'TEST_02',
      text: 'Due date of the task',
      label: null,
      options: [],
      optionSetId: null,
      detail: null,
      questionId: '66a3026524db84151500005f',
      detailLabel: null,
      validationCriteria: {},
      visibilityCriteria: {},
      config: {},
      componentId: '66a3026524db841515000060',
    },
    {
      id: '66a3026524db841515000063',
      componentNumber: 4,
      name: 'Select a the person who this task should be assigned to',
      type: 'FreeText',
      code: 'TEST_03',
      text: 'Select a the person who this task should be assigned to',
      label: null,
      options: [],
      optionSetId: null,
      detail: null,
      questionId: '66a3026524db841515000063',
      detailLabel: null,
      validationCriteria: {},
      visibilityCriteria: {},
      config: {},
      componentId: '66a3026524db841515000064',
    },
  ],
  countryId: '5d3f884471bb2e31bfacae23',
  userId: '5e729d5a61f76a411c026bd8',
  timezone: 'Pacific/Auckland',
  answers: {
    '66a3026324db841515000056': '5dfc692a61f76a44b92b7309',
    '66a3026524db84151500005b': 'Yes',
    '66a3026524db84151500005f': '2024-07-26T02:05:54.920Z',
    '66a3026524db841515000063': 'TomC',
  },
};
export class SubmitSurveyResponseRoute extends Route<SubmitSurveyResponseRequest> {
  public async buildResponse() {
    const surveyResponseData = testData;
    const { central: centralApi } = this.req.ctx.services;
    const { session, models } = this.req;

    const { qr_codes_to_create, recent_entities, ...processedResponse } =
      // @ts-ignore
      await processSurveyResponse(models, surveyResponseData);

    await centralApi.createSurveyResponses(
      [processedResponse],
      // If the user is not logged in, submit the survey response as public
      processedResponse.user_id ? undefined : { submitAsPublic: true },
    );

    // If the user is logged in, add the entities they answered to their recent entities list
    if (!!session && processedResponse.user_id) {
      const { user_id: userId } = processedResponse;
      // add these after the survey response has been submitted because we want to be able to add newly created entities to the recent entities list
      await addRecentEntities(models, userId, recent_entities);
    }

    return {
      qrCodeEntitiesCreated: qr_codes_to_create || [],
    };
  }
}
