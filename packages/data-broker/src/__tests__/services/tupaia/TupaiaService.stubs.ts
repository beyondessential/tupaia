/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createModelsStub as baseCreateModelsStub } from '@tupaia/database';
import type { TupaiaDataApi } from '@tupaia/data-api';
import { createJestMockInstance } from '@tupaia/utils';
import { Analytic, Event } from '../../../types';
import { DATA_ELEMENT_METADATA, DATA_GROUP_METADATA } from './TupaiaService.fixtures';

export const createModelsStub = () => {
  return baseCreateModelsStub({
    dataSource: {
      records: [],
      extraMethods: {
        getTypes: () => ({ DATA_ELEMENT: 'dataElement', DATA_GROUP: 'dataGroup' }),
      },
    },
  });
};

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
    fetchDataGroup: jest
      .fn()
      .mockImplementation(
        async (dataGroupCode: keyof typeof DATA_GROUP_METADATA, dataElementCodes: string[]) => {
          const dataGroup = DATA_GROUP_METADATA[dataGroupCode];
          const dataElements = Object.values(DATA_ELEMENT_METADATA).filter(de =>
            dataElementCodes.includes(de.code),
          );

          return {
            ...dataGroup,
            dataElements,
          };
        },
      ),
  });
