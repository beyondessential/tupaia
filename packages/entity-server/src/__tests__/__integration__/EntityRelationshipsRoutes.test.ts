/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { TestableEntityServer, setupTestApp, tearDownTestApp } from '../testUtilities';
import { COUNTRIES } from './fixtures';

describe('relationships', () => {
  let app: TestableEntityServer;

  beforeAll(async () => {
    app = await setupTestApp();
    app.grantAccessToCountries(COUNTRIES);
  });

  afterAll(() => tearDownTestApp(app));

  describe('/hierarchy/:hierarchyName/:entityCode/relationships', () => {
    describe('errors', () => {
      it('throws error if no type in descendant_filter', async () => {
        const { text } = await app.get('hierarchy/redblue/redblue/relationships', {
          query: { descendant_filter: 'name==Kanto' },
        });

        const error = JSON.parse(text);

        expect(error.error).toContain('descendant_filter:type url parameter must be present');
      });

      it('throws if type in ancestor_filter is non-equality', async () => {
        const { text } = await app.get('hierarchy/redblue/redblue/relationships', {
          query: {
            ancestor_filter: 'type!=country',
            descendant_filter: 'type==facility',
          },
        });

        const error = JSON.parse(text);

        expect(error.error).toContain(
          'ancestor_filter:type must be a basic equality, single, not null type constraint',
        );
      });

      it('throws if type in descendant_filter is non-equality', async () => {
        const { text } = await app.get('hierarchy/redblue/redblue/relationships', {
          query: {
            descendant_filter: 'type==facility,village',
          },
        });

        const error = JSON.parse(text);

        expect(error.error).toContain(
          'descendant_filter:type must be a basic equality, single, not null type constraint',
        );
      });
    });

    it('defaults to fetching relationships to requested entity, grouped by ancestor, with codes', async () => {
      const { text } = await app.get('hierarchy/redblue/LAVENDER/relationships', {
        query: { descendant_filter: 'type==facility' },
      });

      const entities = JSON.parse(text);
      expect(entities).toEqual({ LAVENDER: ['PKMN_TOWER'] });
    });

    it('can fetch relations by ancestor type', async () => {
      const { text } = await app.get('hierarchy/redblue/KANTO/relationships', {
        query: { ancestor_filter: 'type==city', descendant_filter: 'type==facility' },
      });

      const entities = JSON.parse(text);
      expect(entities).toEqual({
        CELADON: ['CELADON_GAME'],
        CERULEAN: ['CERULEAN_CAVE'],
        CINNABAR: ['PKMN_MANSION'],
        FUCHSIA: ['SAFARI'],
        LAVENDER: ['PKMN_TOWER'],
        SAFFRON: ['SILPH'],
      });
    });

    it('can group relations by descendant', async () => {
      const { text } = await app.get('hierarchy/redblue/FUCHSIA/relationships', {
        query: {
          descendant_filter: 'type==facility',
          groupBy: 'descendant',
        },
      });

      const entities = JSON.parse(text);
      expect(entities).toEqual({ SAFARI: 'FUCHSIA' });
    });

    it('can return other simple field as keys', async () => {
      const { text } = await app.get('hierarchy/redblue/CERULEAN/relationships', {
        query: {
          ancestor_filter: 'type==country',
          descendant_filter: 'type==facility',
          field: 'name',
        },
      });

      const entities = JSON.parse(text);
      expect(entities).toEqual({ Kanto: ['Cerulean Cave'] });
    });

    it('can fetch relationships in an alternate hierarchy', async () => {
      const { text } = await app.get('hierarchy/goldsilver/goldsilver/relationships', {
        query: {
          ancestor_filter: 'type==country',
          descendant_filter: 'type==facility',
        },
      });

      const entities = JSON.parse(text) as Record<string, string[]>;
      const sortedEntities = Object.fromEntries(
        Object.entries(entities).map(([country, facilities]) => [country, facilities.sort()]),
      );
      expect(sortedEntities).toEqual({
        JOHTO: [
          'BURNED_TOWER',
          'DRAGONS_DEN',
          'OLIVINE_LIGHTHOUSE',
          'SLOWPOKE_WELL',
          'BELL_TOWER',
          'SPROUT_TOWER',
        ].sort(),
        KANTO: ['SILPH', 'CELADON_GAME', 'CERULEAN_CAVE', 'LAVENDER_RADIO_TOWER'].sort(),
      });
    });
  });

  describe('/hierarchy/:hierarchyName/relationships', () => {
    it('can fetch relationships of multiple entities', async () => {
      const { text } = await app.post('hierarchy/redblue/relationships', {
        query: { fields: 'code,name,type', descendant_filter: 'type==facility' },
        body: { entities: ['CINNABAR', 'CELADON', 'LAVENDER'] },
      });

      const entities = JSON.parse(text);
      expect(entities).toEqual({
        CINNABAR: ['PKMN_MANSION'],
        CELADON: ['CELADON_GAME'],
        LAVENDER: ['PKMN_TOWER'],
      });
    });

    it('can fetch relationships of multiple entities in an alternate hierarchy', async () => {
      const { text } = await app.post('hierarchy/goldsilver/relationships', {
        query: {
          fields: 'code,name,type',
          ancestor_filter: 'type==country',
          descendant_filter: 'type==facility',
          groupBy: 'descendant',
        },
        body: { entities: ['CINNABAR', 'CELADON', 'LAVENDER', 'ECRUTEAK'] },
      });

      const entities = JSON.parse(text);
      expect(entities).toEqual({
        BELL_TOWER: 'JOHTO',
        BURNED_TOWER: 'JOHTO',
        CELADON_GAME: 'KANTO',
        LAVENDER_RADIO_TOWER: 'KANTO',
      });
    });
  });
});
