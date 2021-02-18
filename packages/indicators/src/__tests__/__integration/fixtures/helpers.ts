/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { arrayToAnalytics } from '@tupaia/data-broker';

// surveyCode, entityCode, submissionTime, answers
export type ArraySurveyResponse = [string, string, string, Record<string, string>];

export const arrayToSurveyResponse = (arrayResponse: ArraySurveyResponse) => {
  const [surveyCode, entityCode, date, answers] = arrayResponse;
  return { surveyCode, entityCode, submission_time: `${date}T15:00:00Z`, answers };
};

// startDate, endDate, organisationUnitCodes
type ArrayFetchOptions = [string, string, string[]];

const arrayToFetchOptions = ([startDate, endDate, organisationUnitCodes]: ArrayFetchOptions) => ({
  startDate,
  endDate,
  organisationUnitCodes,
});

// dataElement, organisationUnit, period, value
type ArrayAnalytic = [string, string, string, number];

// description, indicatorCodes, arrayFetchOptions, expected
export type ArrayTestCase = [string, string[], ArrayFetchOptions, string | ArrayAnalytic[]];

export const arrayToTestCase = (arrayTestCase: ArrayTestCase) => {
  const [description, indicatorCodes, arrayFetchOptions, expected] = arrayTestCase;
  // `expected` can be either a string (error message) or an array (expected analytics)
  const throws = typeof expected === 'string';

  return {
    description,
    input: {
      indicatorCodes,
      fetchOptions: arrayToFetchOptions(arrayFetchOptions),
    },
    throws,
    expected: throws ? expected : arrayToAnalytics(expected),
  };
};

type IndicatorEntries = Record<string, Record<string, unknown>>;

export const entriesToArithmeticIndicators = (entries: IndicatorEntries) =>
  Object.entries(entries).map(([code, config]) => {
    const newConfig = { ...config };
    if (config.parameters) {
      newConfig.parameters = entriesToArithmeticIndicators(config.parameters as IndicatorEntries);
    }
    return { code, builder: 'arithmetic', config: newConfig };
  });
