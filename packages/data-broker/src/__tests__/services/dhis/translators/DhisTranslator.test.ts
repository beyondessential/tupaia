/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createJestMockInstance } from '@tupaia/utils';
import { DhisTranslator } from '../../../../services/dhis/translators/DhisTranslator';
import { DATA_ELEMENT_DESCRIPTORS } from './DhisTranslator.fixtures';
import * as ParseValueFromDhis from '../../../../services/dhis/translators/parseValueForDhis';

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

  describe('translateInboundDataElements', () => {});

  describe('translateInboundIndicators', () => {});
});
