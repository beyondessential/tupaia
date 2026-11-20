import { SurveyResponseModel } from '@tupaia/database';
import { ensure } from '@tupaia/tsutils';
import { Question, QuestionType } from '@tupaia/types';
import { getBrowserTimeZone } from '@tupaia/utils';

import { CurrentUser } from '../../api';
import { DatatrakWebModelRegistry } from '../../types';

/** Question types whose answers are plain text, so need no uploads or entity lookups */
const SIMULATABLE_QUESTION_TYPES = new Set<string>([QuestionType.FreeText, QuestionType.Number]);

export interface SimulateSaveSurveyResponsesResult {
  surveyCode: string;
  responseCount: number;
  answerCount: number;
  durationMs: number;
}

const findSurveyWithSimulatableQuestions = async (
  models: DatatrakWebModelRegistry,
  projectId: string,
) => {
  const surveys = await models.survey.find({ project_id: projectId });
  for (const survey of surveys) {
    // QuestionRecord isn't typed with its fields
    const questions = ((await survey.questions()) as unknown as Question[]).filter(question =>
      SIMULATABLE_QUESTION_TYPES.has(question.type),
    );
    if (questions.length === 0) continue;

    const [countryCode] = await survey.getCountryCodes();
    if (!countryCode) continue;

    const entity = await models.entity.findOne({ code: countryCode }, { columns: ['id'] });
    if (!entity) continue;

    return { survey, questions, entityId: entity.id };
  }

  throw new Error('No survey in the current project has FreeText or Number questions to simulate');
};

/**
 * Performance testing helper: saves `count` fake survey responses (with FreeText/Number answers)
 * to the local database in a single transaction, mirroring the offline survey submission path.
 *
 * These are real records, so they will be pushed to the server on the next sync.
 */
export const simulateSaveSurveyResponses = async ({
  models,
  user,
  count,
}: {
  models: DatatrakWebModelRegistry;
  user: CurrentUser;
  count: number;
}): Promise<SimulateSaveSurveyResponsesResult> => {
  const userId = ensure(user.id, 'A user must be logged in to simulate survey responses');
  const projectId = ensure(user.projectId, 'A project must be selected to simulate survey responses');

  const { survey, questions, entityId } = await findSurveyWithSimulatableQuestions(
    models,
    projectId,
  );

  const timezone = getBrowserTimeZone();
  const timestamp = new Date().toISOString();
  const responses = Array.from({ length: count }, (_, i) => ({
    survey_id: survey.id,
    entity_id: entityId,
    timestamp,
    timezone,
    answers: questions.map(question => ({
      type: question.type,
      question_id: question.id,
      body: question.type === QuestionType.Number ? String(i) : `Simulated response ${i}`,
    })),
  }));

  const start = performance.now();
  await models.wrapInRepeatableReadTransaction(async transactingModels => {
    await SurveyResponseModel.saveResponsesToDatabase(transactingModels, userId, responses);
  });
  const durationMs = Math.round(performance.now() - start);

  return {
    surveyCode: survey.code,
    responseCount: count,
    answerCount: count * questions.length,
    durationMs,
  };
};
