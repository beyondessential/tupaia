/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { assertAdminPanelAccess } from '../../permissions';

export const assertUserHasAccessToLandingPage = async (models, accessPolicy, landingPageId) => {
  assertAdminPanelAccess(accessPolicy);
  const userProjects = await models.project.getAccessibleProjects(accessPolicy);
  const landingPage = await models.landingPage.findById(landingPageId);
  const hasAccess = userProjects.some(project => landingPage.project_codes.includes(project.code));
  if (!hasAccess) {
    throw new Error('You do not have access to edit this landing page');
  }
  return true;
};
