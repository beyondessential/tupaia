/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { hasNoContent, takesDateForm, takesIdForm, yup, yupUtils } from '@tupaia/utils';

export const eventOptionsValidator = yup.object().shape({
  organisationUnitCodes: yup.array().of(yup.string().required()).strict().required(),
  startDate: yup
    .string()
    .test(
      yupUtils.yupTestAnySync(
        [hasNoContent, takesDateForm],
        'startDate should be in ISO 8601 format',
      ),
    ),
  endDate: yup
    .string()
    .test(
      yupUtils.yupTestAnySync(
        [hasNoContent, takesDateForm],
        'endDate should be in ISO 8601 format',
      ),
    ),
  dataElementCodes: yup.array().of(yup.string().required()).strict(),
  dataGroupCode: yup.string().strict().required(),
  eventId: yup.string().test(yupUtils.yupTestAnySync([hasNoContent, takesIdForm])),
});

const aggregationStringValidator = yup.string().strict().required();
const aggregationObjectValidator = yup.object().shape({
  type: yup.string().strict(),
  config: yup.object(),
});

export const analyticsOptionsValidator = yup.object().shape({
  organisationUnitCodes: yup.array().of(yup.string().required()).strict().required(),
  startDate: yup
    .string()
    .test(
      yupUtils.yupTestAnySync(
        [hasNoContent, takesDateForm],
        'startDate should be in ISO 8601 format',
      ),
    ),
  endDate: yup
    .string()
    .test(
      yupUtils.yupTestAnySync(
        [hasNoContent, takesDateForm],
        'endDate should be in ISO 8601 format',
      ),
    ),
  dataElementCodes: yup.array().of(yup.string().required()).strict().required(),
  aggregations: yup
    .array()
    .of<typeof aggregationStringValidator | typeof aggregationObjectValidator>(
      yup.lazy((value: unknown) =>
        typeof value === 'string' ? aggregationStringValidator : aggregationObjectValidator,
      ) as any, // TODO: Upgrade to yup to avoid having to cast as 'any' here: https://github.com/jquense/yup/issues/1190
    ),
});
