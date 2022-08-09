/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { respond, DatabaseError, UnauthenticatedError } from '@tupaia/utils';
import { buildMeditrakSyncQuery } from '../utilities';
import { LegacyCountChangesHandler } from './LegacyCountChangesHandler';
import { allowNoPermissions } from '../../permissions';

const handleNonLegacyRequest = async (req, res) => {
  const { models } = req;
  const { query } = await buildMeditrakSyncQuery(req, { select: 'count(*)' });
  const queryResult = await query.executeOnDatabase(models.database);
  const changeCount = parseInt(queryResult[0].count);
  respond(res, { changeCount });
};

const isLegacyRequest = req => !req.query.appVersion;

/**
 * Responds to GET requests to the /changes/count endpoint
 */
export async function countChanges(req, res) {
  await req.assertPermissions(allowNoPermissions);

  try {
    if (isLegacyRequest(req)) {
      const handler = new LegacyCountChangesHandler(req, res);
      await handler.handle();
    } else {
      await handleNonLegacyRequest(req, res);
    }
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      throw error;
    }
    throw new DatabaseError('counting the number of changes to sync', error);
  }
}
