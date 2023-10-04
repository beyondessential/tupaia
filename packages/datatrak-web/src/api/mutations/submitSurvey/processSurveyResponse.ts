/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { getBrowserTimeZone } from '@tupaia/utils';
import moment from 'moment';
import { DatatrakWebSubmitSurveyRequest as RequestT } from '@tupaia/types';
import { isUpsertEntityQuestion } from './utils';
import { Entity, Survey, SurveyScreenComponent } from '../../../types';

type AutocompleteAnswer = {
  isNew?: boolean;
  optionSetId: string;
  value: string;
  label: string;
};

type Answers = RequestT.Answers | AutocompleteAnswer;

type SurveyResponseData = {
  surveyId?: Survey['id'];
  countryId?: Entity['id'];
  questions?: SurveyScreenComponent[];
  answers?: Answers;
  surveyStartTime?: string;
};

// Process the survey response data into the format expected by the endpoint
export const processSurveyResponse = ({
  surveyId,
  countryId,
  questions = [],
  answers = {},
  surveyStartTime,
}: SurveyResponseData) => {
  const timezone = getBrowserTimeZone();
  const timestamp = moment().toISOString();
  // Fields to be used in the survey response
  const surveyResponse = {
    survey_id: surveyId,
    start_time: surveyStartTime,
    entity_id: countryId,
    end_time: timestamp,
    data_time: timestamp,
    timestamp,
    timezone,
    options_created: [],
    entities_upserted: [],
    answers: {},
  } as RequestT.ReqBody;
  // Process answers and save the response in the database
  const answersToSubmit = [] as Record<string, unknown>[];

  for (const question of questions) {
    const { questionId, questionType, id } = question;
    const answer = answers[questionId];
    if (answer === undefined || answer === null || answer === '') {
      continue;
    }

    // base answer object to be added to the answers array
    const answerObject = {
      id,
      question_id: questionId,
      type: questionType,
      body: answer,
    };

    // Handle special question types
    // TODO: add in photo and file upload handling, as well as adding new entities when these question types are implemented
    switch (questionType) {
      // format dates to be ISO strings
      case 'SubmissionDate':
      case 'DateOfData':
        surveyResponse.data_time = moment(answer as string).toISOString();
        break;
      // add the entity id to the response if the question is a primary entity question
      case 'PrimaryEntity': {
        surveyResponse.entity_id = answer as string;
        break;
      }
      case 'Entity': {
        if (isUpsertEntityQuestion(question.config)) {
          surveyResponse.entities_upserted.push({
            questionId,
            config: question.config as RequestT.EntityQuestionConfig,
          });
        }
        answersToSubmit.push(answerObject);
        break;
      }
      case 'Autocomplete': {
        // if the answer is a new option, add it to the options_created array to be added to the DB
        const { isNew, value, label, optionSetId } = answer as AutocompleteAnswer;
        if (isNew) {
          surveyResponse.options_created.push({
            option_set_id: optionSetId,
            value,
            label,
          });
        }
        answersToSubmit.push({
          ...answerObject,
          body: value,
        });
        break;
      }
      default:
        answersToSubmit.push(answerObject);
        break;
    }
  }

  return { ...surveyResponse, answers: answersToSubmit };
};
