import { Row } from '../../../types';

export type MatrixParams = {
  columns: { include: string[] | '*'; exclude: string[] };
  rows: { rowField: string; categoryField: string };
};

export type Matrix = {
  columns: {
    key: string;
    title: string;
  }[];
  rows: Row[];
};
