import { GETHandler } from '../GETHandler';
import { assertBESAdminAccess } from '../../permissions';

/**
 * Handles endpoints:
 * - /reports
 * - /reports/:reportId
 */
export class GETReports extends GETHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertBESAdminAccess);
  }
}
