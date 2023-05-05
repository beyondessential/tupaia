/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { BESAdminCreateHandler } from '../CreateHandler';

export class CreateLandingPage extends BESAdminCreateHandler {
  async createRecord() {
    const { project_codes: projectCodes, ...baseFields } = this.newRecordFields;

    const newLandingPage = await this.models.LandingPage.create(baseFields);

    if (projectCodes) {
      newLandingPage.attachProjects(projectCodes);
    }
  }
}
