import { yup } from '@tupaia/utils';

export const draftDashboardItemValidator = yup.object().shape({
  code: yup.string().required('Requires "code" for the visualisation'),
  config: yup.object().shape({ type: yup.string().required('Requires "type" in chart config') }),
  reportCode: yup.string().required('Requires "code" for the visualisation'),
  legacy: yup.mixed<false>().oneOf([false]),
});

export const legacyDashboardItemValidator = yup.object().shape({
  code: yup.string().required('Requires "code" for the visualisation'),
  config: yup.object().shape({ type: yup.string().required('Requires "type" in chart config') }),
  reportCode: yup.string().required('Requires "code" for the visualisation'),
  legacy: yup.mixed<true>().oneOf([true]),
});

export const dashboardValidator = yup.object().shape({
  code: yup.string().required(),
  name: yup.string().required(),
  rootEntityCode: yup.string().required(),
  sortOrder: yup.number().nullable(true),
});

export const dashboardRelationObjectValidator = yup.object().shape({
  dashboardCode: yup.string().required(),
  entityTypes: yup.array().of(yup.string().required()).required(),
  projectCodes: yup.array().of(yup.string().required()).required(),
  permissionGroups: yup.array().of(yup.string().required()).required(),
  sortOrder: yup.number().nullable(true),
});
