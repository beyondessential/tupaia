import { Row } from '../../../types';

export type MatrixParams = {
  columns: { prefixColumns: string[]; nonColumnKeys: string[] };
  rows: {
    rowTitle: string;
    category: string;
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
