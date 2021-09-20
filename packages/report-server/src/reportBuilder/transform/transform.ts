/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { Row } from '../types';
import { Context } from '../context';
import { transformBuilders } from './functions';
import { aliases } from './aliases';

export type TransformParams =
  | keyof typeof aliases
  | {
      [key: string]: string | Record<string, string> | undefined;
      transform: string;
      title?: string;
      description?: string;
    };

type BuiltTransformParams = {
  title?: string;
  name: string;
  apply: (rows: Row[]) => Row[];
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

const transform = (rows: Row[], transformSteps: BuiltTransformParams[]): Row[] => {
  let transformedRows: Row[] = rows;
  transformSteps.forEach((transformStep: BuiltTransformParams, index: number) => {
    try {
      transformedRows = transformStep.apply(transformedRows);
    } catch (e) {
      const titlePart = transformStep.title ? ` (${transformStep.title})` : '';
      const errorMessagePrefix = `Error in transform[${index + 1}]${titlePart}: `;
      throw new Error(`${errorMessagePrefix}${(e as Error).message}`);
    }
  });
  return transformedRows;
};

const buildParams = (params: unknown, context?: Context): BuiltTransformParams => {
  const validatedParams: TransformParams = transformParamsValidator.validateSync(params);
  if (typeof validatedParams === 'string') {
    return {
      name: validatedParams,
      apply: aliases[validatedParams](),
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
    apply: transformBuilders[transformStep](restOfTransformParams, context as Context),
  };
};

export const buildTransform = (params: unknown, context?: Context) => {
  const validatedParams = paramsValidator.validateSync(params);

  const builtParams = validatedParams.map(param => buildParams(param, context));
  return (rows: Row[]) => transform(rows, builtParams);
};
