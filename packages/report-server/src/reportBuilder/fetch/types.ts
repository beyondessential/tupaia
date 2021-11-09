/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Row } from '../types';

export interface FetchResponse {
  results: Row[];
  metadata?: {
    dataElementCodeToName?: Record<string, string>;
  };
}
