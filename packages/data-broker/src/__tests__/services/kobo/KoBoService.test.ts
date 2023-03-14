/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

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

  describe('pull()', () => {
    const dataServiceMapping = new DataServiceMapping();

    describe('pullAnalytics()', () => {
      it('throws an error', async () =>
        expect(koboService.pull([], 'dataElement', { dataServiceMapping })).toBeRejectedWith(
          'not supported',
        ));
    });

    describe('pullEvents()', () => {
      it('throws an error', async () =>
        expect(koboService.pull([], 'dataGroup', { dataServiceMapping })).toBeRejectedWith(
          'not supported',
        ));
    });

    describe('pullSyncGroups()', () => {
      it('pull and translate from api correctly', () =>
        expect(
          koboService.pull([MOCK_DATA_SOURCE], 'syncGroup', { dataServiceMapping }),
        ).resolves.toHaveProperty('xyz', [TRANSLATED_DATA]));
    });
  });

  describe('pullMetadata()', () => {
    const dataServiceMapping = new DataServiceMapping();

    it('default implementation', () =>
      expect(koboService.pullMetadata([], 'dataElement', { dataServiceMapping })).resolves.toEqual(
        [],
      ));
  });
});
