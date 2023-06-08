import { KeysToCamelCase, LandingPage, Project } from '@tupaia/types';

export type SingleProject = KeysToCamelCase<Project> & {
  hasAccess: boolean;
  hasPendingAccess: boolean;
  homeEntityCode: string;
};

export type SingleLandingPage = KeysToCamelCase<LandingPage> & {
  projects: SingleProject[];
};
