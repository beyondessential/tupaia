/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { TransformTable } from '../../transform';

export const buildRowsAndColumns = () => {
  return (table: TransformTable) => ({
    columns: table.getColumns(),
    rows: table.getRows(),
  });
};
