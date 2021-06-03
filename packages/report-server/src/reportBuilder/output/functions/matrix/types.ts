import { Row } from '../../../types';

export type MatrixColumnParams = string[] | '*';

export type MatrixParams = {
  columns: { prefixColumns: MatrixColumnParams; nonColumnKeys: string[] };
  rows: {
    rowField: string;
    categoryField: string;
  };
};

export type Column = {
  key: string;
  title: string;
};

export type Matrix = {
  columns: Column[];
  rows: Row[];
};
