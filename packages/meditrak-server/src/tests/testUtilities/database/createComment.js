/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getModels } from '../../getModels';
import { upsertRecord } from './upsertRecord';
import { generateTestId } from '..';

const models = getModels();

export const createComment = async ({ alert_id, user_id, text }) => {
  const comment = await upsertRecord(models.comment, { user_id, text });

  await upsertRecord(models.alertComment, {
    alert_id,
    comment_id: comment.id,
  });

  return comment;
};
