/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Row, DataElementsMetadata, PeriodMetadata } from '../types';

export interface FetchResponse extends DataElementsMetadata, PeriodMetadata {
  results: Row[];
}
