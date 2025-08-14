import { useQuery } from '@tanstack/react-query';
import { get } from '../../VizBuilderApp/api/api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../../VizBuilderApp/api/constants';

export const useSurveyResponseAnswers = surveyResponseId =>
  useQuery(
    ['surveyResponses', surveyResponseId],
    async () => {
      const endpoint = `surveyResponses/${surveyResponseId}/answers`;
      return get(endpoint);
    },
    {
      ...DEFAULT_REACT_QUERY_OPTIONS,
    },
  );
