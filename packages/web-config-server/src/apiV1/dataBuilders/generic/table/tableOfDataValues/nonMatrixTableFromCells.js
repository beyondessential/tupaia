import { tableOfCalculatedValues } from './tableOfCalculatedValues';

export const nonMatrixTableFromCells = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builtMatrix = await tableOfCalculatedValues(
    { models, dataBuilderConfig, query, entity },
    aggregator,
    dhisApi,
  );
  const { period, columns, rows } = builtMatrix;
  if (columns.length !== 1) {
    throw new Error(
      `nonMatrixTableFromCells expected only 1 column, ${columns.length} were passed`,
    );
  }
  const { key } = columns[0];

  return {
    period,
    data: rows.map(({ dataElement, [key]: value }) => ({ name: dataElement, value })),
  };
};
