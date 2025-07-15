import { yup } from '@tupaia/utils';

import { Context } from '../context';
import { aliases } from './aliases';
import { TransformBuilder, transformBuilders, TransformName, TransformStep } from './functions';
import { TransformTable } from './table';

interface BuiltTransformParams {
  title?: string;
  name: string;
  apply: TransformStep;
}

const transformParamsValidator = yup.lazy((value: unknown) => {
  if (typeof value === 'string') {
    return yup
      .mixed<keyof typeof aliases>()
      .oneOf(Object.keys(aliases) as (keyof typeof aliases)[])
      .required();
  }

  return yup.object().shape({
    transform: yup
      .mixed<TransformName>()
      .oneOf(Object.keys(transformBuilders) as TransformName[])
      .required(),
    title: yup.string(),
    description: yup.string(),
  });
});

const paramsValidator = yup.array().required();

const transform = async (table: TransformTable, transformSteps: BuiltTransformParams[]) => {
  let transformedTable: TransformTable = table;
  for (let i = 0; i < transformSteps.length; i++) {
    const transformStep = transformSteps[i];
    try {
      transformedTable = await transformStep.apply(transformedTable);
    } catch (e) {
      if (e instanceof ExitWithNoDataSignal) {
        // Return a no data result
        return new TransformTable();
      }
      const titlePart = transformStep.title ? ` (${transformStep.title})` : '';
      const errorMessagePrefix = `Error in transform[${i + 1}]${titlePart}: `;
      (e as Error).message = `${errorMessagePrefix}${(e as Error).message}`;
      throw e;
    }
  }

  return transformedTable;
};

const buildParams = (params: unknown, context: Context): BuiltTransformParams => {
  const validatedParams = transformParamsValidator.validateSync(params);
  if (typeof validatedParams === 'string') {
    return {
      name: validatedParams,
      apply: aliases[validatedParams](context),
    };
  }

  const {
    transform: transformStep,
    title,
    description, // This is purely a cosmetic part of the config, ignore it
    ...restOfTransformParams
  } = validatedParams;

  return {
    title,
    name: transformStep,
    apply: transformBuilders[transformStep](restOfTransformParams, context),
  };
};

export const buildTransform: TransformBuilder = (params, context) => {
  const validatedParams = paramsValidator.validateSync(params);

  const builtParams = validatedParams.map(param => buildParams(param, context));
  return (table: TransformTable) => transform(table, builtParams);
};

/**
 * A signal to exit the transform steps early
 */
export class ExitWithNoDataSignal extends Error {
  constructor() {
    super();
    this.name = 'ExitWithNoDataSignal';
  }
}
