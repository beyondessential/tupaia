/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  LandingPage,
  Project,
  TupaiaWebProjectCountryAccessListRequest,
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

export type CountryAccessListItem = TupaiaWebProjectCountryAccessListRequest.ResBody[number];
