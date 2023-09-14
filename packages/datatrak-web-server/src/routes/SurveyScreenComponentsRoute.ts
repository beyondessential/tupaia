/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import camelcaseKeys from 'camelcase-keys';
import {
  KeysToCamelCase,
  DatatrakWebSurveyScreenComponentsRequest as ScreenComponentsRequest,
} from '@tupaia/types';

export type SurveyScreenComponentsRequest = Request<
  ScreenComponentsRequest.Params,
  ScreenComponentsRequest.ResBody,
  ScreenComponentsRequest.ReqBody,
  ScreenComponentsRequest.ReqQuery
>;

type SurveyScreenComponent = KeysToCamelCase<ScreenComponentsRequest.InitialResponse>;

const parseOption = (option: string) => {
  try {
    const parsedOption = JSON.parse(option!);
    if (!parsedOption.value) {
      // Valid JSON but not a valid option object, e.g. '50'
      throw new Error('Options defined as an object must contain the value key at minimum');
    }
    return parsedOption;
  } catch (e) {
    if (typeof option === 'string')
      return {
        label: option,
        value: option,
      };
    return option;
  }
};

export class SurveyScreenComponentsRoute extends Route<SurveyScreenComponentsRequest> {
  public async buildResponse() {
    const { ctx, params } = this.req;
    const { surveyCode } = params;
    const [survey] = await ctx.services.central.fetchResources('surveys', {
      filter: { code: surveyCode },
    });

    if (!survey) {
      throw new Error(`Could not find survey with code: ${surveyCode}`);
    }

    const columns = [
      'id',
      'question_id',
      'screen_id',
      'component_number',
      'answers_enabling_follow_up',
      'is_follow_up',
      'visibility_criteria',
      'validation_criteria',
      'question_label',
      'detail_label',
      'config',
      'question.name',
      'question.code',
      'question.text',
      'question.name',
      'question.type',
      'question.options',
      'survey_screen.screen_number',
      'question.option_set_id',
    ];

    const results = camelcaseKeys(
      await ctx.services.central.fetchResources(`surveys/${survey.id}/surveyScreenComponents`, {
        columns,
      }),
    );
    const STRINGIFIED_FIELDS = [
      'config',
      'validationCriteria',
      'visibilityCriteria',
    ] as (keyof SurveyScreenComponent)[];

    return results.map((result: SurveyScreenComponent) => {
      const parsedResult: any = { ...result };
      STRINGIFIED_FIELDS.forEach(field => {
        if (parsedResult[field]) {
          parsedResult[field] = JSON.parse(parsedResult[field] as string);
        }
      });
      if (parsedResult.questionOptions) {
        parsedResult.questionOptions = parsedResult.questionOptions.map((option: string) => {
          return parseOption(option);
        });
      }
      return parsedResult;
    });
  }
}
