/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { KoBoService } from '../../../services/kobo/KoBoService';
import { createModelsStub, createKoBoApiStub } from './KoBoService.stubs';
import { MOCK_DATA_SOURCE, TRANSLATED_DATA } from './KoBoService.fixtures';

const models = createModelsStub();
const koboApi = createKoBoApiStub();
const koboService = new KoBoService(models, koboApi);

describe('KoBoService', () => {
  describe('push()', () => {
    it('throws an error', () => expect(koboService.push()).toBeRejectedWith('not supported'));
  });

  describe('delete()', () => {
    it('throws an error', () => expect(koboService.delete()).toBeRejectedWith('not supported'));
  });

  describe('pull()', () => {
    describe('pullAnalytics()', () => {
      it('throws an error', () =>
        expect(koboService.pull({}, 'dataElement')).toBeRejectedWith('not supported'));
    });

    describe('pullEvents()', () => {
      it('throws an error', () =>
        expect(koboService.pull({}, 'dataGroup')).toBeRejectedWith('not supported'));
    });

    describe('pullSyncGroups()', () => {
      it('pull and translate from api correctly', () =>
        expect(koboService.pull([MOCK_DATA_SOURCE], 'syncGroup')).resolves.toHaveProperty('xyz', [
          TRANSLATED_DATA,
        ]));
    });
  });

  describe('pullMetadata()', () => {
    it('throws an error', () =>
      expect(koboService.pullMetadata()).toBeRejectedWith('not supported'));
  });
});
