/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { UserAccount, Survey, Entity } from '../../models';
import { SurveyScreenComponent } from './SurveyRequest';

export type AutocompleteAnswer = {
  isNew?: boolean;
  optionSetId: string;
  value: string;
  label: string;
};

type Answer = string | number | boolean | null | undefined | AutocompleteAnswer;

export type Answers = Record<string, Answer>;

type Question = SurveyScreenComponent;

interface SurveyResponse {
  userId: UserAccount['id'];
  surveyId: Survey['id'];
  countryId: Entity['id'];
  questions: Question[];
  answers: Answers;
  startTime: string;
}

export type Params = Record<string, never>;
export type ResBody = void;
export type ReqBody = SurveyResponse;
export type ReqQuery = Record<string, never>;
