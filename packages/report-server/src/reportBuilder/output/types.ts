/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Row, PeriodMetadata } from '../types';

export interface Response extends PeriodMetadata {
  results: Row[];
}
