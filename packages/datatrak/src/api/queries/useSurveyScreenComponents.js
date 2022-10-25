/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import camelcaseKeys from 'camelcase-keys';
import { groupBy } from 'lodash';
import { get } from '../api';

export const useSurveyScreenComponents = survey => {
  const {
    isSuccess,
    data = [],
    ...restOfQuery
  } = useQuery(['surveys', survey], () => get(`surveys/${survey}/surveyScreenComponents`), {
    staleTime: 1000 * 60 * 60 * 1,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const mappedData = groupBy(data.map(camelcaseKeys), 'surveyScreenScreenNumber');
  return { ...restOfQuery, isSuccess, data: mappedData };
};
