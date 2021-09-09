/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { uniq } from 'lodash';
import moment from 'moment';

import { compareAsc, readJsonFile, yup, yupUtils } from '@tupaia/utils';
import { convertDateRangeToUrlPeriodString } from '../../../src/historyNavigation/utils';

export const buildUrlsUsingConfig = async (db, config, generateUrls) => {
  const { urlFiles = [], urls = [], urlGenerationOptions = {} } = config;
  const urlsFromFiles = urlFiles.map(readJsonFile).flat();
  const generatedUrls = generateUrls ? await generateUrls(db, urlGenerationOptions) : [];

  return [...urlsFromFiles, ...urls, ...generatedUrls];
};

export const sortUrls = urls => uniq(urls).sort(compareAsc);

const { polymorphic, testSync } = yupUtils;

export const buildUrlSchema = ({ regex, regexDescription, shape }) =>
  polymorphic({
    string: yup
      .string()
      .matches(
        regex,
        `url "$\{value}" is not valid, must use the following format: ${regexDescription}`,
      ),
    object: testSync(
      yup.object(shape),
      ({ value, error }) =>
        `invalid url\n${JSON.stringify(value, undefined, 2)}\ncausing message "${error.message}"`,
    ),
  });

export const buildVizPeriod = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return undefined;
  }
  return convertDateRangeToUrlPeriodString({
    startDate: moment(startDate),
    endDate: moment(endDate),
  });
};
