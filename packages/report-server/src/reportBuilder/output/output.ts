/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { Response } from './types';
import { outputBuilders } from './functions';

type OutputParams = {
  type: keyof typeof outputBuilders;
  config: unknown;
};

const paramsValidator = yup.object().shape({
  type: yup
    .mixed<keyof typeof outputBuilders>()
    .oneOf(Object.keys(outputBuilders) as (keyof typeof outputBuilders)[]),
});

const output = (response: Response, params: OutputParams) => {
  const { type, config } = params;

  const outputBuilder = outputBuilders[type](config);
  return outputBuilder(response);
};

const buildParams = (params: unknown): OutputParams => {
  const validatedParams = paramsValidator.validateSync(params);
  const { type = 'default', ...restOfParams } = validatedParams;
  return { type, config: restOfParams };
};

export const buildOutput = (params: unknown) => {
  const builtParams = buildParams(params);
  return (response: Response) => output(response, builtParams);
};
