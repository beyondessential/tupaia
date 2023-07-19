/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';

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
