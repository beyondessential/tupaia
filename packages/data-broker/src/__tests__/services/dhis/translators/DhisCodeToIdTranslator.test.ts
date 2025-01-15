import { translateElementKeysInEventAnalytics } from '@tupaia/dhis-api';
import { DhisEventAnalytics } from '../../../../services/dhis/types';
import { createApiProxyStub, createApiStub } from './DhisCodeToIdTranslator.stubs';

jest.mock('@tupaia/dhis-api');

const mockTranslateElementKeysInEventAnalytics = translateElementKeysInEventAnalytics as jest.Mock;
mockTranslateElementKeysInEventAnalytics.mockImplementation((a: DhisEventAnalytics) => a);

const api = createApiStub();
const proxy = createApiProxyStub(api);

describe('DhisCodeToIdTranslator', () => {
  describe('getAnalytics', () => {
    it('should swap codes for dhisId if all specified', async () => {
      await proxy.getAnalytics({
        dataElementCodes: ['EL1', 'EL2'],
        organisationUnitCodes: ['ORG1'],
      });
      expect(api.getAnalytics).toHaveBeenCalledOnceWith({
        dataElementIds: ['dhisId_el1', 'dhisId_el2'],
        organisationUnitIds: ['dhisId_ou1'],
        inputIdScheme: 'uid',
        outputIdScheme: 'uid',
      });
    });

    it('should not swap any codes for ids if some org units dont have dhisId', async () => {
      await proxy.getAnalytics({
        dataElementCodes: ['EL1', 'EL2'],
        organisationUnitCodes: ['ORG1', 'ORG2'], // org2 not present in mapping table, so doesn't have dhis id
      });
      expect(api.getAnalytics).toHaveBeenCalledOnceWith({
        dataElementCodes: ['EL1', 'EL2'],
        organisationUnitCodes: ['ORG1', 'ORG2'],
      });
    });

    it('should not swap any codes for ids if some data elements dont have dhisId', async () => {
      await proxy.getAnalytics({
        dataElementCodes: ['EL1', 'EL3'], // EL3 does not have dhis id
        organisationUnitCodes: ['ORG1'],
      });
      expect(api.getAnalytics).toHaveBeenCalledOnceWith({
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
      expect(api.getEventAnalytics).toHaveBeenCalledOnceWith({
        dataElementIdScheme: 'id',
        dataElementIds: ['dhisId_el1', 'dhisId_el2'],
        organisationUnitIds: ['dhisId_ou1'],
        programIds: ['dhisId_g1'],
        inputIdScheme: 'uid', // added if all data elements, org units, program swapped to ids
      });
    });

    it('should swap any codes that it can and leave the rest', async () => {
      await proxy.getEventAnalytics({
        dataElementCodes: ['EL1', 'EL2'],
        organisationUnitCodes: ['ORG1', 'ORG2'], // org2 not present in mapping table, so doesn't have dhis id
        programCode: 'G1',
      });
      expect(api.getEventAnalytics).toHaveBeenCalledOnceWith({
        dataElementIdScheme: 'id',
        dataElementIds: ['dhisId_el1', 'dhisId_el2'],
        organisationUnitCodes: ['ORG1', 'ORG2'],
        programIds: ['dhisId_g1'],
      });
    });

    it('should process the response and swap dataElement ids back to codes', async () => {
      await proxy.getEventAnalytics({
        dataElementCodes: ['EL1', 'EL2'],
        organisationUnitCodes: ['ORG1'],
        programCode: 'G1',
      });
      expect(translateElementKeysInEventAnalytics).toHaveBeenCalledOnceWith(
        api.getEventAnalytics({}),
        { dhisId_el1: 'EL1', dhisId_el2: 'EL2' },
      );
    });

    it('should process the response and swap orgUnit ids back to codes', async () => {
      const response = await proxy.getEventAnalytics({
        dataElementCodes: ['EL1', 'EL2'],
        organisationUnitCodes: ['ORG1'],
        programCode: 'G1',
      });
      expect(response).toMatchObject({
        rows: [['ORG1', 'dhisId_ou1', '7.1']],
      });
    });

    it('should be able to swap orgUnit ids that were not fetched', async () => {
      const response = await proxy.getEventAnalytics({
        dataElementCodes: ['EL1', 'EL2'],
        organisationUnitCodes: ['SOME_PARENT_ORG_UNIT'],
        programCode: 'G1',
      });
      expect(api.getEventAnalytics).toHaveBeenCalledOnceWith({
        dataElementIdScheme: 'id',
        dataElementIds: ['dhisId_el1', 'dhisId_el2'],
        organisationUnitCodes: ['SOME_PARENT_ORG_UNIT'],
        programIds: ['dhisId_g1'],
      });
      expect(response).toMatchObject({
        rows: [['ORG1', 'dhisId_ou1', '7.1']],
      });
    });
  });
});
