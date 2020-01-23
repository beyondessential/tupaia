/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import sinon from 'sinon';
import { DhisApi } from '@tupaia/dhis-api';

import { SERVER_NAME } from './dhisService.fixtures';
import { models } from '../../helpers';

export const createDhisApiStub = (codesToIds = {}) => {
  return sinon.createStubInstance(DhisApi, {
    getIdsFromCodes: codes => codes.map(c => codesToIds[c]),
    getServerName: SERVER_NAME,
  });
};

export const createModelsStub = models.getStub;
