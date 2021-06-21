/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Row } from '../../types';

export const buildBar = () => {
  return (rows: Row[]) => ({ data: rows });
};
