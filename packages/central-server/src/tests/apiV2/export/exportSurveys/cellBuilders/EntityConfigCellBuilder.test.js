/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { ANSWER_TYPES } from '../../../../../database/models/Answer';
import { assertCanProcessAndBuild } from './utilities';

const QUESTIONS = [
  {
    id: 'q1',
    code: 'question_1_code',
    validationCriteria: 'mandatory: true',
    type: ANSWER_TYPES.ENTITY,
  },
  {
    id: 'q2',
    code: 'question_2_code',
    validationCriteria: 'mandatory: true',
    type: ANSWER_TYPES.ENTITY,
  },
  {
    id: 'q3',
    code: 'question_3_code',
    validationCriteria: 'mandatory: true',
    type: ANSWER_TYPES.FREE_TEXT,
  },
  {
    id: '123',
    code: 'entity_question',
    type: ANSWER_TYPES.ENTITY,
  },
];

const assertCanProcessAndBuildEntity = config =>
  assertCanProcessAndBuild(QUESTIONS, 'entity_question', config);

describe('EntityConfigCellBuilder', () => {
  it('minimal', async () => {
    await assertCanProcessAndBuildEntity('type: facility');
  });

  it('can point to another question', async () => {
    await assertCanProcessAndBuildEntity('type: facility\r\nparent: question_1_code');
  });

  it('supports attributes.type', async () => {
    await assertCanProcessAndBuildEntity('type: school\r\nattributes.type: question_2_code');
  });

  // TODO: Fix this test
  // it('supports renaming an existing entity', async () => {
  //   await assertCanProcessAndBuildEntity('createNew: No\r\nfields.name: question_3_code');
  // });
});
