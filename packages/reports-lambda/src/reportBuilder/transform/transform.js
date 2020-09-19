import { transformFunctions } from './functions';

export const transform = (rows, transforms) => {
  let transformedRows = rows;
  transforms.forEach(transformConfig => {
    const transformFunction = Object.keys(transformConfig)[0];
    transformedRows = transformFunctions[transformFunction](
      transformedRows,
      transformConfig[transformFunction],
    );
  });
  return transformedRows;
};
