import { createJestMockInstance } from '@tupaia/utils';
import { DhisTranslator } from '../../../../services/dhis/translators/DhisTranslator';
import { DATA_ELEMENT_DESCRIPTORS } from './DhisTranslator.fixtures';
import * as ParseValueFromDhis from '../../../../services/dhis/translators/parseValueForDhis';
import { DataElement } from '../../../../types';

describe('DhisTranslator', () => {
  const mockModels = createJestMockInstance('@tupaia/database', 'ModelRegistry');
  const translator = new DhisTranslator(mockModels);

  describe('getOutboundValue', () => {
    const parseValueForDhisSpy = jest.spyOn(ParseValueFromDhis, 'parseValueForDhis');

    it('returns undefined if value is undefined', () =>
      expect(translator.getOutboundValue(DATA_ELEMENT_DESCRIPTORS.DE_1, undefined)).toEqual(
        undefined,
      ));

    it('uses option value if defined', () =>
      expect(translator.getOutboundValue(DATA_ELEMENT_DESCRIPTORS.DE_2, 'X')).toEqual('X-ray'));

    it('throws if option not found', () =>
      expect(() => translator.getOutboundValue(DATA_ELEMENT_DESCRIPTORS.DE_2, 'z')).toThrow(
        'No option matching',
      ));

    it('formats value for dhis', () => {
      parseValueForDhisSpy.mockReturnValue('Formatted_Value');
      expect(
        translator.getOutboundValue(DATA_ELEMENT_DESCRIPTORS.DE_1, 'Unformatted_Value'),
      ).toEqual('Formatted_Value');
    });
  });

  describe('translateOutboundEventDataValues', () => {});

  describe('translateOutboundEvent', () => {});

  describe('translateInboundAnalytics', () => {});

  describe('translateInboundEvents', () => {});

  describe('translateInboundEventAnalytics', () => {});

  describe('translateInboundDataElements', () => {
    const baseDhisDataElementMetadata = [
      { code: 'codeA', name: 'A', id: 'id_a' },
      { code: 'codeB', name: 'B', id: 'id_b' },
      { code: 'codeC', name: 'C', id: 'id_c' },
    ];

    const baseDhisCategoryOptionComboMetadata = [
      { code: 'SEX_Male', name: 'Male', id: 'id_d' },
      { code: 'SEX_Female', name: 'Female', id: 'id_e' },
    ];

    const dhisServiceType = 'dhis' as const;

    it('translates data element metadata code to data element code', () => {
      const dataElements = [
        {
          code: 'dataElementCodeA',
          dataElementCode: 'codeA',
          service_type: dhisServiceType,
          config: {},
          permission_groups: [],
        },
        {
          code: 'dataElementCodeB',
          dataElementCode: 'codeB',
          service_type: dhisServiceType,
          config: {},
          permission_groups: [],
        },
        {
          code: 'dataElementCodeC',
          dataElementCode: 'codeC',
          service_type: dhisServiceType,
          config: {},
          permission_groups: [],
        },
      ];

      const expectResults = [
        { code: 'dataElementCodeA', name: 'A', id: 'id_a' },
        { code: 'dataElementCodeB', name: 'B', id: 'id_b' },
        { code: 'dataElementCodeC', name: 'C', id: 'id_c' },
      ];

      expect(
        translator.translateInboundDataElements(
          baseDhisDataElementMetadata,
          baseDhisCategoryOptionComboMetadata,
          dataElements,
        ),
      ).toStrictEqual(expect.arrayContaining(expectResults));
    });

    it('works when some data elements share the same dhis data element code', () => {
      const dhisDataElementMetadata = [
        ...baseDhisDataElementMetadata,
        { code: 'codeA_B', name: 'A_B', id: 'id_a_b' },
      ];

      const dataElements: DataElement[] = [
        {
          code: 'dataElementCodeA',
          dataElementCode: 'codeA_B',
          service_type: dhisServiceType,
          config: {
            categoryOptionCombo: 'SEX_Male',
          },
          permission_groups: [],
        },
        {
          code: 'dataElementCodeB',
          dataElementCode: 'codeA_B',
          service_type: dhisServiceType,
          config: {
            categoryOptionCombo: 'SEX_Female',
          },
          permission_groups: [],
        },
        {
          code: 'dataElementCodeC',
          dataElementCode: 'codeC',
          service_type: dhisServiceType,
          config: {},
          permission_groups: [],
        },
      ];

      const expectResults = [
        { code: 'dataElementCodeA', name: 'A_B - Male', id: 'id_a_b' },
        { code: 'dataElementCodeB', name: 'A_B - Female', id: 'id_a_b' },
        { code: 'dataElementCodeC', name: 'C', id: 'id_c' },
      ];

      expect(
        translator.translateInboundDataElements(
          dhisDataElementMetadata,
          baseDhisCategoryOptionComboMetadata,
          dataElements,
        ),
      ).toStrictEqual(expect.arrayContaining(expectResults));
    });

    it('attaches the rest of data elements', () => {
      const dataElements = [
        {
          code: 'dataElementCodeA',
          dataElementCode: 'codeA',
          service_type: dhisServiceType,
          config: {},
          permission_groups: [],
        },
      ];

      const expectResults = [
        { code: 'dataElementCodeA', name: 'A', id: 'id_a' },
        { code: 'codeB', name: 'B', id: 'id_b' },
        { code: 'codeC', name: 'C', id: 'id_c' },
      ];

      expect(
        translator.translateInboundDataElements(
          baseDhisDataElementMetadata,
          baseDhisCategoryOptionComboMetadata,
          dataElements,
        ),
      ).toStrictEqual(expectResults);
    });
  });

  describe('translateInboundIndicators', () => {});
});
