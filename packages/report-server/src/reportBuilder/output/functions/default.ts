/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { TransformTable } from '../../transform';

export const buildDefault = () => {
  return (table: TransformTable) => table.getRows();
};
