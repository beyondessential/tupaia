/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class LandingPageType extends DatabaseType {
  static databaseType = TYPES.LANDING_PAGE;

  async attachProjects(projectCodes) {
    const projects = await this.otherModels.project.find({
      code: projectCodes,
    });
    for (const project of projects) {
      await this.otherModels.landingPageProjects.create({
        landing_page_id: this.id,
        project_id: project.id,
      });
    }
  }

  async detachProjects(projectCodes) {
    const projects = await this.otherModels.project.find({
      code: projectCodes,
    });
    for (const project of projects) {
      await this.otherModels.landingPageProjects.delete({
        landing_page_id: this.id,
        project_id: project.id,
      });
    }
  }

  async getAttachedProjects() {
    const projectRelations = await this.otherModels.landingPageProjects.find({
      landing_page_id: this.id,
    });

    return this.otherModels.project.find({
      id: projectRelations.map(({ project_id: projectId }) => projectId),
    });
  }
}

export class LandingPageModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return LandingPageType;
  }
}
