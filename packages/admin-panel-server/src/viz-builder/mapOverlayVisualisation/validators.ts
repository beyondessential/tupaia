/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

// TODO: complete when implementing saving
export const draftMapOverlayValidator = yup.object().shape({
  code: yup.string().required('Requires "code" for the visualisation'),
  name: yup.string().required('Requires "name" for the visualisation'),
  config: yup.object().shape({ type: yup.string().required('Requires "type" in chart config') }),
  reportCode: yup.string().required('Requires "code" for the visualisation'),
  legacy: yup.mixed<false>().oneOf([false]),
});