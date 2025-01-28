import { allowNoPermissions } from '../../permissions';
import { GETHandler } from '../GETHandler';

export class GETDashboardMailingLists extends GETHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(allowNoPermissions);
  }
}
