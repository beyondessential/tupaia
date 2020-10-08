import { Row } from '../reportBuilder';
import { transformBuilders } from './functions';

type TransformParams = {
  apply: (rows: Row[]) => Row[];
};

const transform = (rows: Row[], transforms: TransformParams[]): Row[] => {
  let transformedRows: Row[] = rows;
  transforms.forEach((transform: TransformParams) => {
    transformedRows = transform.apply(transformedRows);
  });
  return transformedRows;
};

const buildParams = (params: unknown): TransformParams => {
  if (typeof params !== 'object' || params === null) {
    throw new Error(`Expected object but got ${params}`);
  }

  if (!('transform' in params)) {
    throw new Error(`Expected transform in params`);
  }

  const { transform, ...restOfTransformParams } = params;
  if (typeof transform !== 'string' || !(transform in transformBuilders)) {
    throw new Error(
      `Expected transform to be one of ${Object.keys(transformBuilders)} but got ${transform}`,
    );
  }

  return {
    apply: transformBuilders[transform as keyof typeof transformBuilders](restOfTransformParams),
  };
};

export const buildTransform = (params: unknown) => {
  if (!Array.isArray(params)) {
    throw new Error(`Expected array of transform configs, but got ${params}`);
  }

  const builtParams = params.map(param => buildParams(param));
  return (rows: Row[]) => transform(rows, builtParams);
};
