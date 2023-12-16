/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import { createJestMockInstance } from '@tupaia/utils';
import { ORGANISATION_UNIT_ID } from './AggregateDataPusher.fixtures';

// taken directly from a DHIS2 api call, with redundant info stripped out
const SUCCESS_DIAGNOSTICS = {
  wasSuccessful: true,
};

export const createDhisApiStub = () =>
  createJestMockInstance('@tupaia/dhis-api', 'DhisApi', {
    postDataSetCompletion: async () => SUCCESS_DIAGNOSTICS,
    deleteDataSetCompletion: async () => SUCCESS_DIAGNOSTICS,
    getDataSetByCode: async () => null,
    getIdFromCode: async () => ORGANISATION_UNIT_ID,
  });
