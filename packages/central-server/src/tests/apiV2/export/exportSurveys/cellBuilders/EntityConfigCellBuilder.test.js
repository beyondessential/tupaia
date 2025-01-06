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
  {
    id: 'q5',
    code: 'question_5_code',
    validationCriteria: 'mandatory: true',
    type: ANSWER_TYPES.CODE_GENERATOR,
  },
];

const assertCanProcessAndBuildEntity = config =>
  assertCanProcessAndBuild(QUESTIONS, 'entity_question', config);

describe('EntityConfigCellBuilder', () => {
  it('minimal', async () => {
    await assertCanProcessAndBuildEntity('filter.type: facility');
  });

  it('can point to another question', async () => {
    await assertCanProcessAndBuildEntity('filter.type: facility\r\nfilter.parent: question_1_code');
  });

  it('supports attributes.type', async () => {
    await assertCanProcessAndBuildEntity(
      'filter.type: school\r\nfilter.attributes.type: question_2_code',
    );
  });

  it('supports renaming an existing entity', async () => {
    await assertCanProcessAndBuildEntity(
      'createNew: No\r\nfilter.type: school\r\nfields.name: question_3_code',
    );
  });

  it('supports validating presence of fields.name, fields.code AND fields.type when createNew is true', async () => {
    await assertCanProcessAndBuildEntity(
      'createNew: Yes\r\nfields.name: question_3_code\r\nfields.code: question_5_code\r\nfields.type: school',
    );
  });

  it('supports validating filter.type as multiple entities', async () => {
    await assertCanProcessAndBuildEntity(
      'createNew: No\r\nfilter.type: school,facility\r\nfields.name: question_3_code',
    );
  });
});
