/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Row } from '../../../types';

export type RawDataExport = {
  columns: {
    key: string;
    title: string;
  }[];
  rows: Row[];
};
