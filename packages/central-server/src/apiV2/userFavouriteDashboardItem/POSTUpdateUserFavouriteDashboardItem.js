import { respond } from '@tupaia/utils';
import { assertAnyPermissions } from '../../permissions';
import { CRUDHandler } from '../CRUDHandler';

/**
 * Handles POST endpoints:
 * - /userFavouriteDashboardItem
 */

export class POSTUpdateUserFavouriteDashboardItem extends CRUDHandler {
  async assertUserHasAccess() {
    const assertUserIsLoggedIn = () => {
      const { userId } = this.req;
      if (!userId) {
        throw new Error('User should be logged in');
      }
    };

    return this.assertPermissions(assertAnyPermissions([assertUserIsLoggedIn]));
  }

  async handleRequest() {
    const { models, body, userId } = this.req;
    const { dashboardItemCode, state } = body;

    const user = await models.user.findOne({ id: userId });
    const dashboardItemCodeToId = await models.dashboardItem.findIdByCode(dashboardItemCode);
    const dashboardItemId = dashboardItemCodeToId[dashboardItemCode];
    if (!user || !dashboardItemId) {
      throw new Error(`user or dashboard item not found`);
    }

    if (state === 'favourite') {
      await models.userFavouriteDashboardItem.favourite(userId, dashboardItemId);
    }
    if (state === 'unfavourite') {
      await models.userFavouriteDashboardItem.unfavourite(userId, dashboardItemId);
    }

    respond(this.res, { message: 'successfully modified' });
  }
}
