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
  // Soft-delete so the record is picked up by the next sync push with isDeleted: true
  return models.surveyResponseDraft.updateById(draftId, { is_deleted: true });
};
