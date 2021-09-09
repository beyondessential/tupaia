/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Row } from '../types';
import { transformBuilders } from './functions';
import { aliases } from './aliases';

type TransformParams = {
  name: string;
  apply: (rows: Row[]) => Row[];
};

const transform = (rows: Row[], transformSteps: TransformParams[]): Row[] => {
  let transformedRows: Row[] = rows;
  transformSteps.forEach((transformStep: TransformParams) => {
    transformedRows = transformStep.apply(transformedRows);
  });
  return transformedRows;
};

const buildParams = (params: unknown): TransformParams => {
  if (typeof params === 'string') {
    if (!(params in aliases)) {
      throw new Error(
        `Expected transform alias to be one of ${Object.keys(aliases)}, but got: ${params}`,
      );
    }

    return {
      name: params,
      apply: aliases[params as keyof typeof aliases](),
    };
  }

  if (typeof params !== 'object' || params === null) {
    throw new Error(`Expected object but got ${params}`);
  }

  if (!('transform' in params)) {
    throw new Error(`Expected transform in params`);
  }

  const {
    transform: transformStep,
    $title: title, // This is purely a cosmetic part of the config, ignore it
    $description: description, // This is purely a cosmetic part of the config, ignore it
    ...restOfTransformParams
  } = params;
  if (typeof transformStep !== 'string' || !(transformStep in transformBuilders)) {
    throw new Error(
      `Expected transform to be one of ${Object.keys(transformBuilders)} but got ${transformStep}`,
    );
  }

  return {
    name: transformStep,
    apply: transformBuilders[transformStep as keyof typeof transformBuilders](
      restOfTransformParams,
    ),
  };
};

export const buildTransform = (params: unknown) => {
  if (!Array.isArray(params)) {
    throw new Error(`Expected array of transform configs, but got ${params}`);
  }

  const builtParams = params.map(param => buildParams(param));
  return (rows: Row[]) => transform(rows, builtParams);
};
