import { yup } from '@tupaia/utils';

import { ReportServerAggregator } from '../../aggregator';
import { TransformTable } from '../transform';
import { outputBuilders } from './functions/outputBuilders';

type OutputParams = {
  type: keyof typeof outputBuilders;
  config: unknown;
};

const paramsValidator = yup.object().shape({
  type: yup
    .mixed<keyof typeof outputBuilders>()
    .oneOf(Object.keys(outputBuilders) as (keyof typeof outputBuilders)[]),
});

const output = (
  table: TransformTable,
  params: OutputParams,
  aggregator: ReportServerAggregator,
) => {
  const { type, config } = params;

  const outputBuilder = outputBuilders[type](config);
  return outputBuilder(table, aggregator);
};

const buildParams = (params: unknown): OutputParams => {
  const validatedParams = paramsValidator.validateSync(params);
  const { type = 'default', ...restOfParams } = validatedParams;
  return { type, config: restOfParams };
};

export const buildOutput = (params: unknown, aggregator: ReportServerAggregator) => {
  const builtParams = buildParams(params);
  return (table: TransformTable) => output(table, builtParams, aggregator);
};
