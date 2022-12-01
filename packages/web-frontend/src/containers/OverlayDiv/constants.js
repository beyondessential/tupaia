import { isMobile } from '../../utils';

export const LANDING = 'landing';
export const VIEW_PROJECTS = 'viewProjects';
export const PROJECT_LANDING = 'projectLanding';
export const DISASTER = 'disaster';
export const REQUEST_PROJECT_ACCESS = 'requestProjectAccess';
export const OVERLAY_PADDING = `35px ${isMobile() ? '35px' : '64px'}`;

export const PROJECTS_WITH_LANDING_PAGES = {
  aim_demo: true,
  covidau: true,
};
