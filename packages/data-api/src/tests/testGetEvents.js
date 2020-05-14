/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { expect } from 'chai';
import { getTestDatabase } from '@tupaia/database';

import { TupaiaDataApi } from '../TupaiaDataApi';

export const testGetEvents = () => {
  const api = new TupaiaDataApi(getTestDatabase());

  it('throws an error with invalid parameters', () => {});
  it('returns results in the correct format', () => {});
  it('respects start and end dates', () => {});
};
