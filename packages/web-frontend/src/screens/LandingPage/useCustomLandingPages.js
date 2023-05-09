/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useSelector } from 'react-redux';

function getLandingPageProjects(landingPage, projects) {
  if (!landingPage) {
    return [];
  }
  const landingPageProjectsCodes = landingPage.projects.map(({ code }) => code);
  return projects.filter(project => landingPageProjectsCodes.includes(project.code));
}

export const useCustomLandingPages = () => {
  const projectData = useSelector(({ project }) => project?.projects || []);
  const landingPage = useSelector(state => state.project.customLandingPage);

  return {
    isCustomLandingPage: !!landingPage,
    customLandingPageSettings: landingPage || {},
    projects: getLandingPageProjects(landingPage, projectData),
  };
};
