/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { PermissionsError } from '@tupaia/utils';
import { PermissionsChecker } from './PermissionsChecker';

export class MapOverlayPermissionsChecker extends PermissionsChecker {
  getMapOverlayId() {
    const { mapOverlayId } = this.query;
    if (!mapOverlayId) {
      throw new Error('No map overlay id was provided');
    }
    return mapOverlayId;
  }

  async fetchAndCacheOverlay() {
    if (!this.overlay) {
      this.overlay = await this.models.mapOverlay.find({ id: this.getMapOverlayId() });
    }
    return this.overlay;
  }

  async fetchPermissionGroups() {
    const overlay = await this.fetchAndCacheOverlay();
    return [overlay.userGroup];
  }

  async checkPermissions() {
    // run standard permission checks against entity
    await super.checkPermissions();

    // get measure by id from db, check it matches user permissions
    if (this.entity.getOrganisationLevel() === 'World') {
      throw new PermissionsError('Measures data not allowed for world');
    }

    const overlay = await this.fetchAndCacheOverlay();
    const mapOverlayId = this.getMapOverlayId();
    if (overlay[0]?.id !== mapOverlayId) {
      throw new Error(`Map overlay ${mapOverlayId} could not be found in the database`);
    }

    await this.checkHasEntityAccess(this.entity.code);
  }
}
