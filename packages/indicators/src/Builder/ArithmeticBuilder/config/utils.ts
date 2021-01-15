/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Indicator } from '../../../types';

export const getParameter = (parameters: Indicator[], code: string) =>
  parameters.find(p => p.code === code);

export const isParameterCode = (parameters: Indicator[], code: string) =>
  !!getParameter(parameters, code);
