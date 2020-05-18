import { getModels } from '../../getModels';
import { upsertRecord } from './upsertRecord';
import { generateTestId } from '..';

const models = getModels();

export const createComment = async ({ alert_id, user_account_id, text }) => {
  const comment = await upsertRecord(models.comment, { user_account_id, text });

  await upsertRecord(models.alertComment, {
    id: generateTestId(),
    alert_id,
    comment_id: comment.id
  });

  return comment;
};
