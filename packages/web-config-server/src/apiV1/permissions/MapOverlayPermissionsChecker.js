import { PermissionsError } from '@tupaia/utils';
import { PermissionsChecker } from './PermissionsChecker';

export class MapOverlayPermissionsChecker extends PermissionsChecker {
  getMapOverlayCode() {
    const { mapOverlayCode } = this.query;
    if (!mapOverlayCode) {
      throw new Error('No map overlay code was provided');
    }
    return mapOverlayCode;
  }

  async fetchAndCacheOverlay() {
    if (!this.overlay) {
      this.overlay = await this.models.mapOverlay.find({ code: this.getMapOverlayCode() });
    }
    return this.overlay;
  }

  async fetchPermissionGroups() {
    const overlay = await this.fetchAndCacheOverlay();
    return [overlay.permission_group];
  }

  async checkPermissions() {
    // run standard permission checks against entity
    await super.checkPermissions();

    // get measure by id from db, check it matches user permissions
    if (this.entity.getOrganisationLevel() === 'World') {
      throw new PermissionsError('Measures data not allowed for world');
    }

    const overlay = await this.fetchAndCacheOverlay();
    const mapOverlayCode = this.getMapOverlayCode();
    if (overlay[0]?.code !== mapOverlayCode) {
      throw new Error(`Map overlay ${mapOverlayCode} could not be found in the database`);
    }

    await this.checkHasEntityAccess(this.entity.code);
  }
}
