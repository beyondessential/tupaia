import { Row } from '../../../types';

export type RawDataExport = {
  columns: {
    key: string;
    title: string;
  }[];
  rows: Row[];
};
