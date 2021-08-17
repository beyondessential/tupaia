/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { KoBoTranslator } from '../../../services/kobo/KoBoTranslator';
import { createModelsStub } from './KoBoService.stubs';
import {
  MOCK_KOBO_RESULT,
  MOCK_QUESTION_MAP,
  MOCK_QUESTION_ANSWER_MAP,
} from './KoBoService.fixtures';

describe('KoBoTranslator', () => {
  const mockModels = createModelsStub();
  const translator = new KoBoTranslator(mockModels);

  describe('fetchEntityInfoFromKoBoAnswer', () => {
    it('Finds a tupaia entity from a kobo entity code', async () => {
      const result = await translator.fetchEntityInfoFromKoBoAnswer('KoBoA');
      expect(result).toStrictEqual({
        orgUnit: 'TupaiaEntityA',
        orgUnitName: 'Tupaia Entity A',
      });
    });

    it('Returns kobo entity code if it maps to a non-existant tupaia entity', async () => {
      const result = await translator.fetchEntityInfoFromKoBoAnswer('KoBoC');
      expect(result).toStrictEqual({
        orgUnit: 'KoBoC',
        orgUnitName: 'KoBoC',
      });
    });

    it('Returns kobo entity code if no mapping can be found', async () => {
      const result = await translator.fetchEntityInfoFromKoBoAnswer('NotARealCode');
      expect(result).toStrictEqual({
        orgUnit: 'NotARealCode',
        orgUnitName: 'NotARealCode',
      });
    });
  });

  describe('translateSingleKoBoResult', () => {
    it('Map KoBo metadata fields to event info fields', async () => {
      const translatedResult = await translator.translateSingleKoBoResult(
        MOCK_KOBO_RESULT,
        {},
        'entity',
      );
      expect(translatedResult).toStrictEqual({
        event: 1234,
        eventDate: '1954-04-11T01:23:45',
        assessor: 'Kermit',
        orgUnit: 'TupaiaEntityA',
        orgUnitName: 'Tupaia Entity A',
        dataValues: {},
      });
    });

    it('Map question codes into new data values', async () => {
      const translatedResult = await translator.translateSingleKoBoResult(
        MOCK_KOBO_RESULT,
        MOCK_QUESTION_MAP,
        'entity',
      );
      expect(translatedResult.dataValues).toStrictEqual({
        person: 'them',
        thing: 'that',
        place: 'there',
        time: 'then',
        reason: 'because',
      });
    });

    it('Map answer into new values', async () => {
      const translatedResult = await translator.translateSingleKoBoResult(
        MOCK_KOBO_RESULT,
        MOCK_QUESTION_ANSWER_MAP,
        'entity',
      );
      expect(translatedResult.dataValues).toStrictEqual({
        person: 'them',
        thing: 'those',
        place: 'here',
        time: 'now',
        reason: 'because',
      });
    });
  });
});
