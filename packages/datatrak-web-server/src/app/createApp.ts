/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { TupaiaDatabase } from '@tupaia/database';
import {
  OrchestratorApiBuilder,
  handleWith,
  attachSessionIfAvailable,
  SessionSwitchingAuthHandler,
  forwardRequest,
} from '@tupaia/server-boilerplate';
import { DataTrakSessionModel } from '../models';
import {
  UserRoute,
  UserRequest,
  SurveysRoute,
  SurveysRequest,
  SurveyResponsesRequest,
  SurveyResponsesRoute,
  ProjectsRoute,
  ProjectsRequest,
  SurveyRequest,
  SurveyRoute,
  SingleEntityRequest,
  SingleEntityRoute,
  EntitiesRequest,
  EntitiesRoute,
  ProjectRequest,
  ProjectRoute,
  SubmitSurveyRoute,
  SubmitSurveyRequest,
  RecentSurveysRequest,
  RecentSurveysRoute,
  LeaderboardRequest,
  LeaderboardRoute,
  ActivityFeedRequest,
  ActivityFeedRoute,
  SingleSurveyResponseRoute,
  SingleSurveyResponseRequest,
} from '../routes';

const {
  WEB_CONFIG_API_URL = 'http://localhost:8000/api/v1',
  CENTRAL_API_URL = 'http://localhost:8090/v2',
} = process.env;

const authHandlerProvider = (req: Request) => new SessionSwitchingAuthHandler(req);

export async function createApp() {
  const builder = new OrchestratorApiBuilder(new TupaiaDatabase(), 'datatrak-web-server', {
    attachModels: true,
  })
    .useSessionModel(DataTrakSessionModel)
    .useAttachSession(attachSessionIfAvailable)
    .attachApiClientToContext(authHandlerProvider)
    .post<SubmitSurveyRequest>('submitSurvey', handleWith(SubmitSurveyRoute))
    .get<UserRequest>('getUser', handleWith(UserRoute))
    .get<SingleEntityRequest>('entity/:projectCode/:entityCode', handleWith(SingleEntityRoute))
    .get<EntitiesRequest>('entities', handleWith(EntitiesRoute))
    .get<SurveysRequest>('surveys', handleWith(SurveysRoute))
    .get<SurveyResponsesRequest>('surveyResponses', handleWith(SurveyResponsesRoute))
    .get<SurveyRequest>('surveys/:surveyCode', handleWith(SurveyRoute))
    .get<ProjectsRequest>('projects', handleWith(ProjectsRoute))
    .get<LeaderboardRequest>('leaderboard', handleWith(LeaderboardRoute))
    .get<ProjectRequest>('project/:projectCode', handleWith(ProjectRoute))
    .get<RecentSurveysRequest>('recentSurveys', handleWith(RecentSurveysRoute))
    .get<ActivityFeedRequest>('activityFeed', handleWith(ActivityFeedRoute))
    .get<SingleSurveyResponseRequest>('surveyResponse/:id', handleWith(SingleSurveyResponseRoute))
    .use('signup', forwardRequest(WEB_CONFIG_API_URL, { authHandlerProvider }))
    // Forward everything else to central server
    .use('*', forwardRequest(CENTRAL_API_URL, { authHandlerProvider }));

  await builder.initialiseApiClient([
    { entityCode: 'DL', permissionGroupName: 'Public' }, //	Demo Land
    { entityCode: 'FJ', permissionGroupName: 'Public' }, //	Fiji
    { entityCode: 'CK', permissionGroupName: 'Public' }, //	Cook Islands
    { entityCode: 'PG', permissionGroupName: 'Public' }, //	Papua New Guinea
    { entityCode: 'SB', permissionGroupName: 'Public' }, //	Solomon Islands
    { entityCode: 'TK', permissionGroupName: 'Public' }, //	Tokelau
    { entityCode: 'VE', permissionGroupName: 'Public' }, //	Venezuela
    { entityCode: 'WS', permissionGroupName: 'Public' }, //	Samoa
    { entityCode: 'KI', permissionGroupName: 'Public' }, //	Kiribati
    { entityCode: 'TO', permissionGroupName: 'Public' }, //	Tonga
    { entityCode: 'NG', permissionGroupName: 'Public' }, //	Nigeria
    { entityCode: 'VU', permissionGroupName: 'Public' }, //	Vanuatu
    { entityCode: 'AU', permissionGroupName: 'Public' }, //	Australia
    { entityCode: 'PW', permissionGroupName: 'Public' }, //	Palau
    { entityCode: 'NU', permissionGroupName: 'Public' }, //	Niue
    { entityCode: 'TV', permissionGroupName: 'Public' }, //	Tuvalu
  ]);

  const app = builder.build();

  return app;
}
