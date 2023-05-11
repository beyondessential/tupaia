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
  const isCustomLandingPageLoading = useSelector(state => state.project.isLoadingCustomLandingPage);

  return {
    isCustomLandingPageLoading,
    isCustomLandingPage: !!landingPage,
    customLandingPageSettings: landingPage || {},
    // tupaia requires projects to work so we can assume that if there are no projects, it's just
    // because they haven't loaded yet. We can replace this with more idiomatic loading state
    // when we refactor to use react-query
    isProjectsLoading: projectData.length === 0,
    projects: getLandingPageProjects(landingPage, projectData),
  };
};
