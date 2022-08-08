/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import type { TupaiaDataApi } from '@tupaia/data-api';
import { createJestMockInstance } from '@tupaia/utils';
import { Analytic, Event } from '../../../types';
import { DATA_ELEMENT_METADATA } from './TupaiaService.fixtures';

export const createTupaiaDataApiStub = ({
  fetchAnalyticsResponse,
  fetchEventsResponse,
}: {
  fetchAnalyticsResponse: { analytics: Analytic[] };
  fetchEventsResponse: Event[];
}): TupaiaDataApi =>
  createJestMockInstance('@tupaia/data-api', 'TupaiaDataApi', {
    fetchAnalytics: jest.fn().mockResolvedValue(fetchAnalyticsResponse),
    fetchEvents: jest.fn().mockResolvedValue(fetchEventsResponse),
    fetchDataElements: jest
      .fn()
      .mockImplementation(async (dataElementCodes: (keyof typeof DATA_ELEMENT_METADATA)[]) =>
        dataElementCodes.map(code => DATA_ELEMENT_METADATA[code]).filter(de => de),
      ),
  });
