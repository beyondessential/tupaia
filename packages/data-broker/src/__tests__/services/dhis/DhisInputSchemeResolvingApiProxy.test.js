/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { translateElementKeysInEventAnalytics } from '@tupaia/dhis-api';
import { createApiProxyStub, createApiStub } from './DhisInputSchemeResolvingApiProxy.stubs';

jest.mock('@tupaia/dhis-api');

const api = createApiStub();
const proxy = createApiProxyStub(api);

describe('DhisInputSchemeResolvingApiProxy', () => {
  describe('getAnalytics', () => {
    it('should swap codes for dhisId if all specified', async () => {
      await proxy.getAnalytics({
        dataElementCodes: ['EL1', 'EL2'],
        organisationUnitCodes: ['ORG1'],
      });
      return expect(api.getAnalytics).toHaveBeenCalledOnceWith({
        dataElementIds: ['dhisId_el1', 'dhisId_el2'],
        organisationUnitIds: ['dhisId_ou1'],
        inputIdScheme: 'uid',
      });
    });

    it('should not swap any codes for ids if some org units dont have dhisId', async () => {
      await proxy.getAnalytics({
        dataElementCodes: ['EL1', 'EL2'],
        organisationUnitCodes: ['ORG1', 'ORG2'], // org2 not present in mapping table, so doesn't have dhis id
      });
      return expect(api.getAnalytics).toHaveBeenCalledOnceWith({
        dataElementCodes: ['EL1', 'EL2'],
        organisationUnitCodes: ['ORG1', 'ORG2'],
      });
    });

    it('should not swap any codes for ids if some data elements dont have dhisId', async () => {
      await proxy.getAnalytics({
        dataElementCodes: ['EL1', 'EL3'], // EL3 does not have dhis id
        organisationUnitCodes: ['ORG1'],
      });
      return expect(api.getAnalytics).toHaveBeenCalledOnceWith({
        dataElementCodes: ['EL1', 'EL3'],
        organisationUnitCodes: ['ORG1'],
      });
    });
  });

  describe('getEventAnalytics', () => {
    it('should swap codes for dhisId if all specified', async () => {
      await proxy.getEventAnalytics({
        dataElementCodes: ['EL1', 'EL2'],
        organisationUnitCodes: ['ORG1'],
        programCode: 'G1',
      });
      return expect(api.getEventAnalytics).toHaveBeenCalledOnceWith({
        dataElementIdScheme: 'id',
        dataElementIds: ['dhisId_el1', 'dhisId_el2'],
        organisationUnitIds: ['dhisId_ou1'],
        programId: 'dhisId_g1',
      });
    });

    it('should swap any codes that it can and leave the rest', async () => {
      await proxy.getEventAnalytics({
        dataElementCodes: ['EL1', 'EL2'],
        organisationUnitCodes: ['ORG1', 'ORG2'], // org2 not present in mapping table, so doesn't have dhis id
        programCode: 'G1',
      });
      return expect(api.getEventAnalytics).toHaveBeenCalledOnceWith({
        dataElementIdScheme: 'id',
        dataElementIds: ['dhisId_el1', 'dhisId_el2'],
        organisationUnitCodes: ['ORG1', 'ORG2'],
        programId: 'dhisId_g1',
      });
    });

    it('should process the response and swap ids back to codes', async () => {
      await proxy.getEventAnalytics({
        dataElementCodes: ['EL1', 'EL2'],
        organisationUnitCodes: ['ORG1'],
        programCode: 'G1',
      });
      return expect(translateElementKeysInEventAnalytics).toHaveBeenCalledOnceWith(
        {
          SOME_EVENT_ANALYTICS_RESPONSE: 1,
        },
        { dhisId_el1: 'EL1', dhisId_el2: 'EL2' },
      );
    });
  });
});
