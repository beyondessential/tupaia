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

  describe('translateKoBoResults', () => {
    it('Maps KoBo metadata fields to event info fields', async () => {
      const results = await translator.translateKoBoResults([MOCK_KOBO_RESULT], {}, 'entity');
      expect(results).toStrictEqual([
        {
          event: '1234',
          eventDate: '1954-04-11T01:23:45',
          assessor: 'Kermit',
          orgUnit: 'TupaiaEntityA',
          orgUnitName: 'Tupaia Entity A',
          dataValues: {},
        },
      ]);
    });

    it('Maps question codes into new data values', async () => {
      const [result] = await translator.translateKoBoResults(
        [MOCK_KOBO_RESULT],
        MOCK_QUESTION_MAP,
        'entity',
      );
      expect(result.dataValues).toStrictEqual({
        person: 'them',
        thing: 'that',
        place: 'there',
        time: 'then',
        reason: 'because',
      });
    });

    it('Maps answer into new values', async () => {
      const [result] = await translator.translateKoBoResults(
        [MOCK_KOBO_RESULT],
        MOCK_QUESTION_ANSWER_MAP,
        'entity',
      );
      expect(result.dataValues).toStrictEqual({
        person: 'them',
        thing: 'those',
        place: 'here',
        time: 'now',
        reason: 'because',
      });
    });

    it('Returns kobo entity code if it maps to a non-existant tupaia entity', async () => {
      const [result] = await translator.translateKoBoResults(
        [{ ...MOCK_KOBO_RESULT, entity: 'KoboC' }],
        MOCK_QUESTION_MAP,
        'entity',
      );
      expect(result).toMatchObject({
        orgUnit: 'KoboC',
        orgUnitName: 'KoboC',
      });
    });

    it('Returns kobo entity code if no mapping can be found', async () => {
      const [result] = await translator.translateKoBoResults(
        [{ ...MOCK_KOBO_RESULT, entity: 'NotARealCode' }],
        MOCK_QUESTION_MAP,
        'entity',
      );
      expect(result).toMatchObject({
        orgUnit: 'NotARealCode',
        orgUnitName: 'NotARealCode',
      });
    });
  });
});
