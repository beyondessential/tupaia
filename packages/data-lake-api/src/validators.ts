import { hasNoContent, takesDateForm, yup, yupUtils } from '@tupaia/utils';

export const eventOptionsValidator = yup.object().shape({
  organisationUnitCodes: yup.array().of(yup.string().required()).strict().required(),
  startDate: yup
    .string()
    .test(
      yupUtils.yupTestAny([hasNoContent, takesDateForm], 'startDate should be in ISO 8601 format'),
    ),
  endDate: yup
    .string()
    .test(
      yupUtils.yupTestAny([hasNoContent, takesDateForm], 'endDate should be in ISO 8601 format'),
    ),
  dataElementCodes: yup.array().of(yup.string().required()).strict(),
  dataGroupCode: yup.string().strict().required(),
  eventId: yup.string().strict(),
});

export const analyticsOptionsValidator = yup.object().shape({
  organisationUnitCodes: yup.array().of(yup.string().required()).strict().required(),
  startDate: yup
    .string()
    .test(
      yupUtils.yupTestAny([hasNoContent, takesDateForm], 'startDate should be in ISO 8601 format'),
    ),
  endDate: yup
    .string()
    .test(
      yupUtils.yupTestAny([hasNoContent, takesDateForm], 'endDate should be in ISO 8601 format'),
    ),
  dataElementCodes: yup.array().of(yup.string().required()).strict().required(),
});
