import { Row } from '../../../types';

export type MatrixParams = {
  columns: { includeFields: string[]; excludeFields: string[] };
  rows: { rowField: string; categoryField: string | undefined };
  attachAllDataElementsToColumns: boolean;
  dataGroups?: string[];
};

export type Matrix = {
  columns: {
    key: string;
    title: string;
  }[];
  rows: Row[];
};
