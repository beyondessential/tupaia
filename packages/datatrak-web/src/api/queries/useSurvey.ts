/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api';
import { DatatrakWebSurveysRequest } from '@tupaia/types';

export const useSurvey = (surveyCode?: string) => {
  return useQuery(
    ['survey', surveyCode],
    (): Promise<DatatrakWebSurveysRequest.ResBody[number]> => get(`surveys/${surveyCode}`),
  );
};
