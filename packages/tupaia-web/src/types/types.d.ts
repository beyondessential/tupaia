/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { Country, LandingPage, Project, TupaiaWebProjectRequest } from '@tupaia/types';
import { KeysToCamelCase } from './helpers';

export type SingleProject = TupaiaWebProjectRequest.ResBody & {
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

export type CountryAccessListItem = Country & {
  hasAccess: boolean;
  accessRequests: string[];
};
