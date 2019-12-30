/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { respond } from '../respond';

/**
 * A temporary function to carry out database admin tasks
 **/
export async function scratchpad(req, res) {
  // Please switch to the 'scratchpad' branch to run scratchpad code, to avoid committing dangerous
  // code to master

  respond(res, { status: 'Ran scratchpad' });
}
