/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DhisTranslator } from '../../../services/dhis/DhisTranslator';
import { createModelsStub } from './DhisTranslator.stubs';
import { DATA_ELEMENTS, DATA_SOURCES } from './DhisTranslator.fixtures';
import { parseValueForDhis } from '../../../services/dhis/parseValueForDhis';

jest.mock('../../../services/dhis/parseValueForDhis');

describe('DhisTranslator', () => {
  const mockModels = createModelsStub();

  describe('getOutboundValue', () => {
    const translator = new DhisTranslator(mockModels);

    it('returns undefined if value is undefined', () =>
      expect(translator.getOutboundValue(DATA_SOURCES.DS_1, undefined)).toEqual(undefined));

    it('uses option value if defined', () =>
      expect(translator.getOutboundValue(DATA_SOURCES.DS_2, 'X')).toEqual('X-ray'));

    it('throws if option not found', () =>
      expect(() => translator.getOutboundValue(DATA_SOURCES.DS_2, 'z')).toThrow(
        'No option matching',
      ));

    it('formats value for dhis', () => {
      parseValueForDhis.mockReturnValue('Formatted_Value');
      expect(translator.getOutboundValue(DATA_SOURCES.DS_1, 'Unformatted_Value')).toEqual(
        'Formatted_Value',
      );
    });
  });

  describe('fetchOutboundDataElementsByCode', () => {});

  describe('translateOutboundDataValue', () => {});

  describe('translateOutboundDataValues', () => {});

  describe('translateOutboundEventDataValues', () => {});

  describe('translateOutboundEvent', () => {});

  describe('translateInboundAnalytics', () => {});

  describe('translateInboundEvents', () => {});

  describe('translateInboundEventAnalytics', () => {});

  describe('translateInboundDataElements', () => {});

  describe('translateInboundIndicators', () => {});
});
