/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { groupBy } from 'lodash';
import { useQuery } from 'react-query';
import { DatatrakWebSurveyScreenComponentsRequest as ScreenComponentsRequest } from '@tupaia/types';
import { get } from '../api';

export const useSurveyScreenComponents = surveyCode => {
  const { data = [], ...query } = useQuery(
    ['surveys', surveyCode],
    (): Promise<ScreenComponentsRequest.ResBody> =>
      get(`surveys/${surveyCode}/surveyScreenComponents`),
  );

  const mappedData = groupBy(data, 'surveyScreenScreenNumber');
  return { ...query, data: mappedData };
};
