import { assertAdminPanelAccess } from '../../permissions';

export const assertUserHasAccessToLandingPage = async (models, accessPolicy, landingPageId) => {
  assertAdminPanelAccess(accessPolicy);
  const userProjects = await models.project.getAccessibleProjects(accessPolicy);
  const landingPage = await models.landingPage.findById(landingPageId);
  const hasAccess = userProjects.some(project => landingPage.project_codes.includes(project.code));
  if (!hasAccess) {
    throw new Error('Need access to a project that the landing page belongs to.');
  }
  return true;
};
