export type MatrixColumnParams = string[] | '*';

export type MatrixParams = {
  columns: { prefixColumns: MatrixColumnParams; nonColumnKeys: string[] };
  rows: {
    rowField: string;
    categoryField: string;
  };
};
