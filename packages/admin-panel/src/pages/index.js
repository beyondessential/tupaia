/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { userIsAuthenticated, userIsNotAuthenticated } from './authCheckers';
import {
  CountriesPage,
  EntitiesPage,
  OptionSetsPage,
  PermissionGroupsPage,
  PermissionsPage,
  SocialFeedPage,
  SurveyResponsesPage,
  SurveysPage,
  QuestionsPage,
  UsersPage,
  DisasterResponsePage,
  DataSourcesPage,
  AccessRequestsPage,
  DashboardReportsPage,
  MapOverlaysPage,
  DashboardGroupsPage,
} from './resources';
import { PermissionDeniedPage } from './PermissionDeniedPage';
import { StrivePage } from './StrivePage';

export const PAGES = {
  '': userIsAuthenticated(SurveysPage), // TODO make home page,
  home: userIsAuthenticated(SurveysPage), // TODO make home page
  countries: userIsAuthenticated(CountriesPage),
  entities: userIsAuthenticated(EntitiesPage),
  permissionDenied: userIsNotAuthenticated(PermissionDeniedPage),
  permissions: userIsAuthenticated(PermissionsPage),
  permissionGroups: userIsAuthenticated(PermissionGroupsPage),
  surveyResponses: userIsAuthenticated(SurveyResponsesPage),
  surveys: userIsAuthenticated(SurveysPage),
  questions: userIsAuthenticated(QuestionsPage),
  users: userIsAuthenticated(UsersPage),
  socialFeed: userIsAuthenticated(SocialFeedPage),
  optionSets: userIsAuthenticated(OptionSetsPage),
  strive: userIsAuthenticated(StrivePage),
  disaster: userIsAuthenticated(DisasterResponsePage),
  dataSources: userIsAuthenticated(DataSourcesPage),
  accessRequests: userIsAuthenticated(AccessRequestsPage),
  dashboardReports: userIsAuthenticated(DashboardReportsPage),
  mapOverlays: userIsAuthenticated(MapOverlaysPage),
  dashboardGroups: userIsAuthenticated(DashboardGroupsPage),
};
