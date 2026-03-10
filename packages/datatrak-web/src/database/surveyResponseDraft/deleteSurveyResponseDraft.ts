import { assertIsNotNullish } from '@tupaia/tsutils';
import { DatatrakWebModelRegistry } from '../../types';

export const deleteSurveyResponseDraft = async ({
  models,
  draftId,
}: {
  models: DatatrakWebModelRegistry;
  draftId?: string;
}) => {
  assertIsNotNullish(draftId, 'deleteSurveyResponseDraft called with undefined draftId');
  return models.surveyResponseDraft.deleteById(draftId);
};
