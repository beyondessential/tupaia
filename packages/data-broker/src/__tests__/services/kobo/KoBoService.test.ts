import { KoBoService } from '../../../services/kobo/KoBoService';
import { createModelsStub, createKoBoApiStub } from './KoBoService.stubs';
import { MOCK_DATA_SOURCE, TRANSLATED_DATA } from './KoBoService.fixtures';
import { DataServiceMapping } from '../../../services/DataServiceMapping';

const models = createModelsStub();
const koboApi = createKoBoApiStub();
const koboService = new KoBoService(models, koboApi);

describe('KoBoService', () => {
  describe('push()', () => {
    it('throws an error', async () => expect(koboService.push()).toBeRejectedWith('not supported'));
  });

  describe('delete()', () => {
    it('throws an error', async () =>
      expect(koboService.delete()).toBeRejectedWith('not supported'));
  });

  describe('pullAnalytics()', () => {
    it('throws an error', async () =>
      expect(koboService.pullAnalytics()).toBeRejectedWith('not supported'));
  });

  describe('pullEvents()', () => {
    it('throws an error', async () =>
      expect(koboService.pullEvents()).toBeRejectedWith('not supported'));
  });

  describe('pullSyncGroupResults()', () => {
    const dataServiceMapping = new DataServiceMapping();

    it('pull and translate from api correctly', async () =>
      expect(
        koboService.pullSyncGroupResults([MOCK_DATA_SOURCE], { dataServiceMapping }),
      ).resolves.toHaveProperty('xyz', [TRANSLATED_DATA]));
  });
});
