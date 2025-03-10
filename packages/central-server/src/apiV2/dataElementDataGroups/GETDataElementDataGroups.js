import { GETHandler } from '../GETHandler';
import { assertBESAdminAccess } from '../../permissions';

/**
 * Handles endpoints:
 * - /dataElementDataGroups
 * - /dataElementDataGroups/:reportId
 */
export class GETDataElementDataGroups extends GETHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertBESAdminAccess);
  }
}
