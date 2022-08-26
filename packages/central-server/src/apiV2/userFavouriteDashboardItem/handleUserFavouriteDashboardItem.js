/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';

/**
 * Handles POST endpoints:
 * - /userFavouriteDashboardItem
 */

export const handleUserFavouriteDashboardItem = async (req, res) => {
  const { models, body, userId } = req;
  const { dashboardItemCode, changeType } = body;

  const user = await models.user.findOne({ id: userId });
  const dashboardItemCodeToId = await models.dashboardItem.findIdByCode(dashboardItemCode);
  const dashboardItemId = dashboardItemCodeToId[dashboardItemCode];
  if (!user || !dashboardItemId) {
    throw new Error(`user or dashboard item not found`);
  }

  const record = {
    user_id: userId,
    dashboard_item_id: dashboardItemId,
  };

  await models.userFavouriteDashboardItem.updateRecord({ changeType, record });
  respond(res, { message: 'successfully modified' });
};
