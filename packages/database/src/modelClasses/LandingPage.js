/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class LandingPageType extends DatabaseType {
  static databaseType = TYPES.LANDING_PAGE;
}

export class LandingPageModel extends DatabaseModel {
  get LandingPageTypeClass() {
    return LandingPageType;
  }

  async getAttachedProjects(landingPageId) {
    const landingPage = await this.findOne({
      id: landingPageId,
    });

    if (!landingPage) return [];

    const projectRelations = await this.otherModels.landingPageProjects.find({
      landingPageId,
    });

    return this.otherModels.project.find({
      id: projectRelations.map(({ project_id: projectId }) => projectId),
    });
  }
}
