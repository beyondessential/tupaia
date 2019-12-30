/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { respond } from '../respond';
import { DatabaseError } from '../errors';
import { getChangesFilter } from './utilities';

/**
 * Responds to GET requests to the /changes/count endpoint
 */
export async function countChanges(req, res) {
  const { models } = req;
  try {
    const changeCount = await models.meditrakSyncQueue.count(getChangesFilter(req.query));
    respond(res, { changeCount });
    return;
  } catch (error) {
    throw new DatabaseError('counting the number of changes to sync', error);
  }
}
