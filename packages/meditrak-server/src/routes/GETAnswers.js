/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from './GETHandler';

export class GETAnswers extends GETHandler {
  checkPermissionsGate() {
    return this.checkPermissions(() => true);
  }
}
