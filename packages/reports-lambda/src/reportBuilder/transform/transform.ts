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

  const transformList = Object.entries(params) as [string, unknown];
  if (transformList.length < 1 || transformList.length > 1) {
    throw new Error(`Expected a single transform defined but got ${transformList.length}`);
  }

  const transform = transformList[0][0] as keyof typeof transformBuilders;
  const transformParams = transformList[0][1] as unknown;
  if (!(transform in transformBuilders)) {
    throw new Error(
      `Expected a transform to be one of ${Object.keys(transformBuilders)} but got ${transform}`,
    );
  }

  return {
    apply: transformBuilders[transform](transformParams),
  };
};

export const buildTransform = (params: unknown) => {
  if (!Array.isArray(params)) {
    throw new Error(`Expected array of transform configs, but got ${params}`);
  }

  const builtParams = params.map(param => buildParams(param));
  return (rows: Row[]) => transform(rows, builtParams);
};
