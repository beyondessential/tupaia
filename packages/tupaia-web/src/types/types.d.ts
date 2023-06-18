import { LandingPage, Project, Entity, Dashboard } from '@tupaia/types';
import { KeysToCamelCase } from './helpers';

export type SingleProject = KeysToCamelCase<Project> & {
  hasAccess: boolean;
  hasPendingAccess: boolean;
  homeEntityCode: string;
  defaultDashboard: string;
  name: string;
  names: string[];
};

export type SingleLandingPage = KeysToCamelCase<Omit<LandingPage, 'project_codes'>> & {
  projects: SingleProject[];
};

export type ProjectCode = Project['code'];

export type EntityCode = Entity['code'];

export type DashboardCode = Dashboard['code'];

export type TupaiaUrlParams = {
  projectCode?: ProjectCode;
  entityCode?: EntityCode;
  dashboardCode?: DashboardCode;
};
