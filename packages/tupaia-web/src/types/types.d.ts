import {
  LandingPage,
  Project,
  ProjectCountryAccessListRequest,
  TupaiaWebProjectRequest,
} from '@tupaia/types';
import { KeysToCamelCase } from './helpers';

export type SingleProject = TupaiaWebProjectRequest.ResBody & {
  hasAccess: boolean;
  hasPendingAccess: boolean;
  homeEntityCode: string;
  defaultDashboard: string;
  name: string;
  entityCode: string;
  names: string[];
  config: any;
};

export type ProjectCode = Project['code'];

export type SingleLandingPage = KeysToCamelCase<Omit<LandingPage, 'project_codes'>> & {
  projects: SingleProject[];
};

export type CountryAccessListItem = ProjectCountryAccessListRequest.ResBody[number];
