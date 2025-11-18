import { uniq } from 'es-toolkit/compat';
import moment from 'moment';

import { compareAsc, readJsonFile, yup, yupUtils } from '@tupaia/utils';

export const buildUrlsUsingConfig = async config => {
  const { urlFiles = [], urls = [] } = config;
  const urlsFromFiles = urlFiles.map(readJsonFile).flat();

  return [...urlsFromFiles, ...urls];
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
  const format = 'Do_MMM_YYYY';

  const formattedStartDate = moment(startDate).format(format);
  const formattedEndDate = moment(endDate).format(format);

  return `${formattedStartDate}-${formattedEndDate}`;
};
