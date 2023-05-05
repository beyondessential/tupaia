/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { BESAdminGETHandler } from '../GETHandler';

export class GETLandingPages extends BESAdminGETHandler {
  async mapLandingPageProjects(landingPage) {
    const projects = await landingPage.getAttachedProjects();
    return { ...landingPage, project_codes: projects.map(x => x.code) };
  }

  async findSingleRecord(landingPageId, options) {
    const landingPage = await super.findSingleRecord(landingPageId, options);
    return this.mapLandingPageProjects(landingPage);
  }

  async findRecords(criteria, options) {
    const landingPages = await super.findRecords(criteria, options);
    return landingPages.map(landingPage => this.mapLandingPageProjects(landingPage));
  }
}
