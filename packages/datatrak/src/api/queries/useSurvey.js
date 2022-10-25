/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';

export const useSurvey = surveyId => {
  return useQuery(['survey', surveyId], () => get(`survey/${surveyId}`), {
    staleTime: 1000 * 60 * 60 * 1,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
