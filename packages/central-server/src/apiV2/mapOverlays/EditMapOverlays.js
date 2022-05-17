/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { EditHandler } from '../EditHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertMapOverlaysEditPermissions } from './assertMapOverlaysPermissions';

export class EditMapOverlays extends EditHandler {
  async assertUserHasAccess() {
    const mapOverlayChecker = accessPolicy =>
      assertMapOverlaysEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, mapOverlayChecker]));
  }

  async editRecord() {
    await this.updateRecord();
  }

  async validate() {
    // mapOverlay uses different id formats and is the only endpoint
    // which need to overwrite the validation functionality
    // TODO remove when this task is done https://github.com/beyondessential/tupaia-backlog/issues/723
    return true;
  }
}
