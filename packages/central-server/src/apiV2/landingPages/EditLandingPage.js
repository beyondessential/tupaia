/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { BESAdminEditHandler } from '../EditHandler';

export class EditLandingPage extends BESAdminEditHandler {
  async editRecord() {
    const { project_codes: projectCodes, ...baseFields } = this.updatedFields;

    if (projectCodes) {
      // Final list of attachedProjectCodes should equal the new projectCodes from updatedFields
      // Remove any that are currently attached but no longer in the new list
      // Add any in the list that aren't currenlty attached
      const landingPage = this.resourceModel.findById(this.recordId);
      const attachedProjectCodes = await landingPage.getAttachedProjects().map(x => x.code);
      const newlyAttachedProjects = projectCodes.filter(code =>
        attachedProjectCodes.includes(code)
      );
      const removedProjects = attachedProjectCodes.filter(code => !projectCodes.includes(code));
      await landingPage.attachProjects(newlyAttachedProjects);
      await landingPage.detachProjects(removedProjects);
    }

    // Apart from project_codes the rest of the fields can be updated directly on the model
    await this.models
      .getModelForDatabaseType(this.recordType)
      .updateById(this.recordId, baseFields);
  }
}
