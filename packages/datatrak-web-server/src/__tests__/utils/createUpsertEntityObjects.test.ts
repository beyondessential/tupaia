/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { createUpsertEntityObjects } from '../../utils/createUpsertEntityObjects';
import { DatatrakWebServerModelRegistry } from '../../types';

const mockEntity = {
  id: 'theEntityId',
  code: 'theEntityCode',
};

const mockModels = {
  entity: {
    findById: () => mockEntity,
  },
};

describe('createUpsertEntityObjects', () => {
  it('does nothing if there are no entity upserts', async () => {
    const upsertEntityObjects = await createUpsertEntityObjects(
      (mockModels as any) as DatatrakWebServerModelRegistry,
      [],
      [],
      'submittedCountryId',
    );
    expect(upsertEntityObjects).toStrictEqual([]);
  });
  it('can create upsertEntityObjects for entity config', async () => {
    const entitiesUpserted = [
      {
        questionId: 'question1',
        config: {
          entity: {
            createNew: true,
            fields: {
              code: {
                questionId: 'question2',
              },
            },
          },
        },
      },
    ];
    const answers = [
      {
        id: 'id1',
        type: 'FreeText',
        body: 'answer1',
        question_id: 'question1',
      },
      {
        id: 'id2',
        type: 'FreeText',
        body: 'answer2',
        question_id: 'question2',
      },
    ];

    const upsertEntityObjects = await createUpsertEntityObjects(
      (mockModels as any) as DatatrakWebServerModelRegistry,
      entitiesUpserted,
      answers,
      'submittedCountryId',
    );
    expect(upsertEntityObjects).toStrictEqual([{ id: 'answer1', code: 'answer2' }]);
  });
});
