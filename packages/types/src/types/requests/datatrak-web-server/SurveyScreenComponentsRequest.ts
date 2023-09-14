/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { KeysToCamelCase } from '../../../utils/casing';
import { SurveyScreenComponent, Question } from '../../models';

export interface Params {
  surveyCode: string;
}

export type InitialResponse = Omit<
  SurveyScreenComponent,
  'config' | 'validation_criteria' | 'visibility_criteria'
> & {
  config?: Record<string, unknown> | null;
  validation_criteria?: Record<string, unknown> | null;
  visibility_criteria?: Record<string, unknown> | null;
  ['question.name']?: Question['name'];
  ['question.code']?: Question['code'];
  ['question.text']?: Question['text'];
  ['question.type']?: Question['type'];
  ['question.options']?: Question['options'];
  ['question.option_set_id']?: Question['option_set_id'];
};

type CamelCasedInitialResponse = KeysToCamelCase<InitialResponse>;

export type ResBody = (Omit<CamelCasedInitialResponse, 'questionOptions'> & {
  // we convert the options to to an array of objects in the response
  questionOptions?: Record<string, unknown>[] | null;
})[];
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
