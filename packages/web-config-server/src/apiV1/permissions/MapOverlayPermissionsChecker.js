/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { MapOverlay } from '/models';
import { PermissionsError } from '@tupaia/utils';
import { PermissionsChecker } from './PermissionsChecker';

export class MapOverlayPermissionsChecker extends PermissionsChecker {
  async checkPermissions() {
    // run standard permission checks against entity
    await super.checkPermissions();

    // get measure by id from db, check it matches user permissions
    const { measureId } = this.query;
    if (this.entity.getOrganisationLevel() === 'World') {
      throw new PermissionsError('Measures data not allowed for world');
    }

    if (!measureId) {
      throw new PermissionsError('No measure id was provided');
    }

    await Promise.all(
      measureId.split(',').map(async id => {
        const overlay = await MapOverlay.findById(id);

        if (!overlay) {
          throw new PermissionsError(`Measure with the id ${id} does not exist`);
        }

        try {
          await this.matchUserGroupToOrganisationUnit(overlay.userGroup);
        } catch (error) {
          throw new Error(`Measure with the id ${id} is not allowed for given organisation unit`);
        }
      }),
    );
  }
}
