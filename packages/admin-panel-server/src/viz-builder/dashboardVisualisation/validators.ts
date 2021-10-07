/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { reportConfigValidator } from './reportConfigValidator';

export const baseVisualisationValidator = yup.object().shape({
  presentation: yup.object(),
  data: yup.object(),
});

export const draftReportValidator = yup.object().shape({
  code: yup.string().required('Requires "code" for the visualisation'),
  config: reportConfigValidator,
});

export const legacyReportValidator = yup.object().shape({
  code: yup.string().required('Requires "code" for the visualisation'),
  dataBuilder: yup.string(),
  config: yup.object(),
  dataServices: yup.array().of(yup.object().shape({ isDataRegional: yup.boolean() })),
});

export const draftDashboardItemValidator = yup.object().shape({
  code: yup.string().required('Requires "code" for the visualisation'),
  config: yup.object().shape({ type: yup.string().required('Requires "type" in chart config') }),
  reportCode: yup.string().required('Requires "code" for the visualisation'),
});

export const dashboardValidator = yup.object().shape({
  code: yup.string().required(),
  name: yup.string().required(),
  rootEntityCode: yup.string().required(),
  sortOrder: yup.number().nullable(true),
});

export const dashboardRelationObjectValidator = yup.object().shape({
  dashboardCode: yup.string().required(),
  entityTypes: yup.array().of(yup.string()).required(),
  projectCodes: yup.array().of(yup.string()).required(),
  permissionGroups: yup.array().of(yup.string()).required(),
  sortOrder: yup.number().nullable(true),
});
