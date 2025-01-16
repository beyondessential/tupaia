import { yup, yupUtils } from '@tupaia/utils';

import { SNAPSHOT_TYPES } from '../../constants';

const { oneOfType, oneOrArrayOf } = yupUtils;

const shape = shapeConfig => yup.object(shapeConfig).noUnknown();

const arrayOf = values => yup.array().of(yup.mixed().oneOf(values));

const strings = yup.array().of(yup.string());
const stringOrStrings = oneOrArrayOf(yup.string());
const stringsOrObjects = yup.array().of(oneOfType([yup.string(), yup.object()]));

export const configSchema = shape({
  // baseline/compare urls are optional, to avoid builds failing with the default config
  // where `compareUrl` is not defined
  baselineUrl: yup.string(),
  compareUrl: yup.string(),
  dashboardReports: shape({
    allowEmptyResponse: yup.boolean(),
    snapshotTypes: arrayOf([SNAPSHOT_TYPES.RESPONSE_DATA, SNAPSHOT_TYPES.HTML]).min(1).required(),
    urlFiles: strings,
    urls: stringsOrObjects,
  }),
  mapOverlays: shape({
    allowEmptyResponse: yup.boolean(),
    snapshotTypes: arrayOf([SNAPSHOT_TYPES.RESPONSE_DATA]).min(1).required(),
    urlFiles: strings,
    urlGenerationOptions: shape({
      id: stringOrStrings,
      project: stringOrStrings,
      orgUnit: stringOrStrings,
    }),
    urls: stringsOrObjects,
  }),
});
