/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import data from './data.json';
import camelcaseKeys from 'camelcase-keys';

import { groupBy } from 'lodash';

export const useSurveyScreenComponents = () => {
  console.log('data', data);
  return groupBy(data.map(camelcaseKeys), 'surveyScreenScreenNumber');
};
