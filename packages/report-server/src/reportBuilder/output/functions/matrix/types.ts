import { MatrixOutputColumn } from '@tupaia/types';
import { Row } from '../../../types';

export type MatrixParams = {
  columns: { includeFields: (string | MatrixOutputColumn)[]; excludeFields: string[] };
  rows: { rowField: string; categoryField: string | undefined };
};

export type Matrix = {
  columns: {
    key: string;
    title: string;
    entityCode?: string;
  }[];
  rows: Row[];
};
