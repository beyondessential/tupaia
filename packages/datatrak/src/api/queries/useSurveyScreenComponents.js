/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import camelcaseKeys from 'camelcase-keys';
import { groupBy } from 'lodash';
import { get } from '../api';
import { REACT_QUERY_DEFAULTS } from '../constants';

export const useSurveyScreenComponents = survey => {
  // const mappedData = groupBy(data.map(camelcaseKeys), 'surveyScreenScreenNumber');
  // return { data: mappedData };
  const { isSuccess, data = [], ...restOfQuery } = useQuery(
    ['surveys', survey],
    () => get(`surveys/${survey}/surveyScreenComponents`),
    REACT_QUERY_DEFAULTS,
  );

  const mappedData = groupBy(data.map(camelcaseKeys), 'surveyScreenScreenNumber');
  return { ...restOfQuery, isSuccess, data: mappedData };
};
