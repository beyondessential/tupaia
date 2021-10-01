/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Row, DataElementsMetadata, PeriodMetadata } from '../types';

export interface Response extends DataElementsMetadata, PeriodMetadata {
  results: Row[];
}
