/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { upsertDummyRecord } from '@tupaia/database';
import { getModels } from '../../getModels';

const models = getModels();

export const createComment = async ({ alert_id: alertId, user_id: userId, text }) => {
  const comment = await upsertDummyRecord(models.comment, { user_id: userId, text });

  await upsertDummyRecord(models.alertComment, {
    alert_id: alertId,
    comment_id: comment.id,
  });

  return comment;
};
