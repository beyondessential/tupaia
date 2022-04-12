/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { takesDateForm, takesIdForm, yup, yupUtils } from '@tupaia/utils';

export const eventOptionsValidator = yup.object().shape({
  organisationUnitCodes: yup.array().of(yup.string().required()).required(),
  startDate: yup.string().test(yupUtils.yupTest(takesDateForm)),
  endDate: yup.string().test(yupUtils.yupTest(takesDateForm)),
  dataElementCodes: yup.array().of(yup.string().required()),
  dataGroupCode: yup.string().required(),
  eventId: yup.string().test(yupUtils.yupTest(takesIdForm)),
});

export const analyticsOptionsValidator = yup.object().shape({
  organisationUnitCodes: yup.array().of(yup.string().required()).required(),
  startDate: yup.string().test(yupUtils.yupTest(takesDateForm)),
  endDate: yup.string().test(yupUtils.yupTest(takesDateForm)),
  dataElementCodes: yup.array().of(yup.string().required()).required(),
});
