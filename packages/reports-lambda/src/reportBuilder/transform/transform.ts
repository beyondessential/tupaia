import { Row } from '../reportBuilder';
import { transformFunctions, transformFunctionBuilders } from './functions';

export type TransformParams = {
  apply: (rows: Row[]) => Row[];
};

export const transform = (rows: Row[], transforms: TransformParams[]): Row[] => {
  let transformedRows: Row[] = rows;
  transforms.forEach((transform: TransformParams) => {
    transformedRows = transform.apply(transformedRows);
  });
  return transformedRows;
};

export const buildTransformParams = (params: unknown): TransformParams => {
  if (typeof params !== 'object' || params === null) {
    throw new Error(`Expected object but got ${params}`);
  }

  const transformList = Object.entries(params) as [string, unknown];
  if (transformList.length < 1 || transformList.length > 1) {
    throw new Error(`Expected a single transform defined but got ${transformList.length}`);
  }

  const transformFunction = transformList[0][0] as keyof typeof transformFunctions;
  const transformParams = transformList[0][1] as unknown;
  if (!(transformFunction in transformFunctions)) {
    throw new Error(
      `Expected a transform to be one of ${Object.keys(
        transformFunctions,
      )} but got ${transformFunction}`,
    );
  }

  return {
    apply: transformFunctionBuilders[transformFunction](transformParams),
  };
};

export const buildTransform = (params: unknown) => {
  if (!Array.isArray(params)) {
    throw new Error(`Expected array of transform configs, but got ${params}`);
  }

  const builtParams = params.map(param => buildTransformParams(param));
  return (rows: Row[]) => transform(rows, builtParams);
};
