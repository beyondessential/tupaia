import { useQuery } from '@tanstack/react-query';

/**
 * @param {TupaiaApi} api
 * @param {string} surveyName
 */
export const useSuggestSurveyCode = (api, surveyName) =>
  useQuery(['useSuggestSurveyCode', surveyName], async () => {
    if (!surveyName) {
      return null;
    }

    const { body } = await api.get('suggestSurveyCode', { surveyName });

    return body.suggestedCode;
  });
