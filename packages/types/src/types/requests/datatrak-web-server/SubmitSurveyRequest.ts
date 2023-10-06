/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { UserAccount, Survey, Entity } from '../../models';

export type EntityQuestionConfig = {
  entity?: {
    createNew?: boolean;
    fields?: Record<string, string | { questionId: string }>;
    filter?: {
      type?: string[];
      grandparentId?: { questionId: string };
      parentId?: { questionId: string };
      attributes?: Record<string, { questionId: string }>;
    };
  };
};

export type AutocompleteAnswer = {
  isNew?: boolean;
  optionSetId: string;
  value: string;
  label: string;
};

type Answer = string | number | boolean | null | undefined | AutocompleteAnswer;

export type Answers = Record<string, Answer>;

// Todo: User survey endpoint question type
interface Question {
  config?: EntityQuestionConfig | Record<string, any>;
  questionType?: string;
  questionText?: string;
  answersEnablingFollowUp?: string[] | null;
  componentNumber: number;
  detailLabel?: string | null;
  id: string;
  isFollowUp?: boolean | null;
  questionId: string;
  questionLabel?: string | null;
  screenId: string;
  validationCriteria?: string | null;
  visibilityCriteria?: string | null;
}

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
