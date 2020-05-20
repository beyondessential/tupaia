/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getModels } from '../../getModels';
import { upsertRecord } from './upsertRecord';

const models = getModels();

export const createComment = async ({ alert_id: alertId, user_id: userId, text }) => {
  const comment = await upsertRecord(models.comment, { user_id: userId, text });

  await upsertRecord(models.alertComment, {
    alert_id: alertId,
    comment_id: comment.id,
  });

  return comment;
};
