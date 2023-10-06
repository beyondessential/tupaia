/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import moment from 'moment';
import { generatePath, useNavigate, useParams } from 'react-router';
import { Coconut } from '../../components';
import { getBrowserTimeZone } from '@tupaia/utils';
import { post } from '../api';
import { Entity, Survey, SurveyScreenComponent } from '../../types';
import { ROUTES } from '../../constants';
import { getAllSurveyComponents, useSurveyForm } from '../../features';
import { useSurvey, useUser } from '../queries';
import { successToast } from '../../utils';

type AutocompleteAnswer = {
  isNew?: boolean;
  optionSetId: string;
  value: string;
  label: string;
};

type Answer = string | number | boolean | null | undefined | AutocompleteAnswer;

type Answers = Record<string, Answer>;

type SurveyResponseData = {
  surveyId?: Survey['id'];
  countryId?: Entity['id'];
  questions?: SurveyScreenComponent[];
  answers?: Answers;
  surveyStartTime?: string;
};

type CreatedOption = {
  option_set_id: string;
  value: string;
  label: string;
};

type SurveyResponse = {
  survey_id: Survey['id'];
  start_time: string;
  data_time: string;
  entity_id: Entity['id'];
  end_time: string;
  timestamp: string;
  timezone: string;
  options_created: CreatedOption[];
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
    data_time: timestamp,
    entity_id: countryId,
    end_time: timestamp,
    timestamp,
    timezone,
    options_created: [] as CreatedOption[],
  } as SurveyResponse;
  // Process answers and save the response in the database
  const answersToSubmit = [] as Record<string, unknown>[];

  for (const question of questions) {
    const { questionId, type, componentId } = question;
    const answer = answers[id];
    if (answer === undefined || answer === null || answer === '') {
      continue;
    }

    // base answer object to be added to the answers array
    const answerObject = {
      id: componentId,
      question_id: questionId,
      type,
      body: answer,
    };

    // Handle special question types
    // TODO: add in photo and file upload handling, as well as adding new entities when these question types are implemented
    switch (type) {
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

// utility hook for getting survey response data
export const useSurveyResponseData = () => {
  const { data: user } = useUser();
  const { surveyCode } = useParams();
  const { surveyStartTime, surveyScreens } = useSurveyForm();
  const { data: survey } = useSurvey(surveyCode);
  return {
    surveyStartTime,
    surveyId: survey?.id,
    questions: getAllSurveyComponents(surveyScreens), // flattened array of survey questions
    countryId: user?.country?.id,
  };
};

export const useSubmitSurvey = () => {
  const navigate = useNavigate();
  const params = useParams();

  const surveyResponseData = useSurveyResponseData();

  return useMutation<any, Error, Answers, unknown>(
    async (answers: Answers) => {
      if (!answers) {
        return;
      }

      const processedResponse = processSurveyResponse({
        ...surveyResponseData,
        answers,
      });

      await post('surveyResponse', {
        data: processedResponse,
      });
    },
    {
      onSuccess: () => {
        successToast("Congratulations! You've earned a coconut", Coconut);
        navigate(generatePath(ROUTES.SURVEY_SUCCESS, params));
      },
    },
  );
};
