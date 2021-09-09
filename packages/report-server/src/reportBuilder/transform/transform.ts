/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { Row } from '../types';
import { transformBuilders } from './functions';
import { aliases } from './aliases';

type TransformParams = {
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

const transform = (rows: Row[], transformSteps: TransformParams[]): Row[] => {
  let transformedRows: Row[] = rows;
  transformSteps.forEach((transformStep: TransformParams, index: number) => {
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

const buildParams = (params: unknown): TransformParams => {
  const validatedParams = transformParamsValidator.validateSync(params);
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
    apply: transformBuilders[transformStep](restOfTransformParams),
  };
};

export const buildTransform = (params: unknown) => {
  const validatedParams = paramsValidator.validateSync(params);

  const builtParams = validatedParams.map(param => buildParams(param));
  return (rows: Row[]) => transform(rows, builtParams);
};
