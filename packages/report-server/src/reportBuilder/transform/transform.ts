/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { Context } from '../context';
import { transformBuilders } from './functions';
import { aliases } from './aliases';
import { TransformTable } from './table';

type BuiltTransformParams = {
  title?: string;
  name: string;
  apply: (table: TransformTable) => TransformTable | Promise<TransformTable>;
};

const transformParamsValidator = yup.lazy((value: unknown) => {
  if (typeof value === 'string') {
    return yup
      .mixed<keyof typeof aliases>()
      .oneOf(Object.keys(aliases) as (keyof typeof aliases)[])
      .required();
  }

  return yup.object().shape({
    transform: yup
      .mixed<keyof typeof transformBuilders>()
      .oneOf(Object.keys(transformBuilders) as (keyof typeof transformBuilders)[])
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
      const titlePart = transformStep.title ? ` (${transformStep.title})` : '';
      const errorMessagePrefix = `Error in transform[${i + 1}]${titlePart}: `;
      throw new Error(`${errorMessagePrefix}${(e as Error).message}`);
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

export const buildTransform = (params: unknown, context: Context) => {
  const validatedParams = paramsValidator.validateSync(params);

  const builtParams = validatedParams.map(param => buildParams(param, context));
  return (table: TransformTable) => transform(table, builtParams);
};
