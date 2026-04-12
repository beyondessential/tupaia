import { ANSWER_TYPES } from '../../../../../database/models/Answer';
import { assertCanProcessAndBuild } from './utilities';

const QUESTIONS = [
  {
    id: 'dp_question_id',
    code: 'dynamic_prefix_question',
    type: ANSWER_TYPES.FREE_TEXT,
  },
  {
    id: 'cg_question_id',
    code: 'code_generator_question',
    type: ANSWER_TYPES.CODE_GENERATOR,
  },
];

const assertCanProcessAndBuildCodeGenerator = config =>
  assertCanProcessAndBuild(QUESTIONS, 'code_generator_question', config);

describe('CodeGeneratorConfigCellBuilder', () => {
  it('minimal', async () => {
    await assertCanProcessAndBuildCodeGenerator('type: mongoid');
  });

  it('shortid type', async () => {
    await assertCanProcessAndBuildCodeGenerator('type: shortid');
  });

  it('static prefix', async () => {
    await assertCanProcessAndBuildCodeGenerator('type: mongoid\r\nprefix: ABC');
  });

  it('dynamicPrefix referencing a question', async () => {
    await assertCanProcessAndBuildCodeGenerator(
      'type: mongoid\r\ndynamicPrefix: dynamic_prefix_question',
    );
  });

  it('dynamicPrefix with entityAttribute', async () => {
    await assertCanProcessAndBuildCodeGenerator(
      'type: mongoid\r\ndynamicPrefix: dynamic_prefix_question\r\ndynamicPrefix.entityAttribute: name',
    );
  });
});
