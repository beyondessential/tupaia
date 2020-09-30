/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';

/**
 * Legacy endpoint that is no longer required
 * TODO get rid of this file when no one is hitting it any more
 */
export async function pruneChanges(req, res) {
  respond(res, { message: 'Success' });
}
