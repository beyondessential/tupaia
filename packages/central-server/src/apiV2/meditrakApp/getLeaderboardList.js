/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';
import { getLeaderboard } from '../../social';
import { allowNoPermissions } from '../../permissions';

export const getLeaderboardList = async (req, res) => {
  const { query, models } = req;

  await req.assertPermissions(allowNoPermissions);

  const items = await getLeaderboard(models, query?.rowCount);

  respond(res, {
    items,
  });
};
