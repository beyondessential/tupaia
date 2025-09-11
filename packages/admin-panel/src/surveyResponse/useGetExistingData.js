/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import { useQuery } from '@tanstack/react-query';
import { get } from '../VizBuilderApp/api/api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../VizBuilderApp/api/constants';

export const useGetExistingData = surveyResponseId =>
  useQuery(
    ['surveyResubmitData', surveyResponseId],
    async () => {
      const responseEndpoint = `surveyResponses/${encodeURIComponent(surveyResponseId)}`;

      const surveyResponse = await get(responseEndpoint);
      const [answers, survey, primaryEntity] = await Promise.all([
        get(`${responseEndpoint}/answers`),
        get(`surveys/${encodeURIComponent(surveyResponse.survey_id)}`),
        get(`entities/${encodeURIComponent(surveyResponse.entity_id)}`),
      ]);

      const answerMap = {};
      for (const answer of answers) {
        for (const screen of survey.surveyQuestions) {
          for (const component of screen.survey_screen_components) {
            if (component.question.id === answer.question_id) {
              answerMap[component.question.code] = answer.text;
            }
          }
        }
        // if we have not found a question to the answer, then it must mean that the question has been removed from this survey, therefore we do not need to send through this answer.
      }

      return { surveyResponse, survey, answers: answerMap, primaryEntity };
    },
    {
      ...DEFAULT_REACT_QUERY_OPTIONS,
    },
  );
