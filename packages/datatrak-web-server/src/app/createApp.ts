/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
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
import { getEnvVarOrDefault } from '@tupaia/utils';
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
  EntityDescendantsRequest,
  EntityDescendantsRoute,
  ProjectRequest,
  ProjectRoute,
  SubmitSurveyResponseRoute,
  SubmitSurveyResponseRequest,
  RecentSurveysRequest,
  RecentSurveysRoute,
  LeaderboardRequest,
  LeaderboardRoute,
  ActivityFeedRequest,
  ActivityFeedRoute,
  SingleSurveyResponseRoute,
  SingleSurveyResponseRequest,
  EntitiesRoute,
  EntitiesRequest,
  GenerateLoginTokenRoute,
  GenerateLoginTokenRequest,
  TasksRequest,
  TasksRoute,
} from '../routes';
import { attachAccessPolicy } from './middleware';

const authHandlerProvider = (req: Request) => new SessionSwitchingAuthHandler(req);

export async function createApp() {
  const WEB_CONFIG_API_URL = getEnvVarOrDefault(
    'WEB_CONFIG_API_URL',
    'http://localhost:8000/api/v1',
  );
  const CENTRAL_API_URL = getEnvVarOrDefault('CENTRAL_API_URL', 'http://localhost:8090/v2');
  const builder = new OrchestratorApiBuilder(new TupaiaDatabase(), 'datatrak-web-server')
    .useSessionModel(DataTrakSessionModel)
    .useAttachSession(attachSessionIfAvailable)
    .use('*', attachAccessPolicy)
    .attachApiClientToContext(authHandlerProvider)
    .post<SubmitSurveyResponseRequest>(
      'submitSurveyResponse',
      handleWith(SubmitSurveyResponseRoute),
    )
    .post<GenerateLoginTokenRequest>('generateLoginToken', handleWith(GenerateLoginTokenRoute))
    .get<UserRequest>('getUser', handleWith(UserRoute))
    .get<SingleEntityRequest>('entity/:entityCode', handleWith(SingleEntityRoute))
    .get<EntityDescendantsRequest>('entityDescendants', handleWith(EntityDescendantsRoute))
    .get<EntitiesRequest>('entities', handleWith(EntitiesRoute))
    .get<SurveysRequest>('surveys', handleWith(SurveysRoute))
    .get<SurveyResponsesRequest>('surveyResponses', handleWith(SurveyResponsesRoute))
    .get<SurveyRequest>('surveys/:surveyCode', handleWith(SurveyRoute))
    .get<ProjectsRequest>('projects', handleWith(ProjectsRoute))
    .get<LeaderboardRequest>('leaderboard', handleWith(LeaderboardRoute))
    .get<ProjectRequest>('project/:projectCode', handleWith(ProjectRoute))
    .get<RecentSurveysRequest>('recentSurveys', handleWith(RecentSurveysRoute))
    .get<ActivityFeedRequest>('activityFeed', handleWith(ActivityFeedRoute))
    .get<TasksRequest>('tasks', handleWith(TasksRoute))
    .get<SingleSurveyResponseRequest>('surveyResponse/:id', handleWith(SingleSurveyResponseRoute))
    // Forward auth requests to web-config
    .use('signup', forwardRequest(WEB_CONFIG_API_URL, { authHandlerProvider }))
    .use('resendEmail', forwardRequest(WEB_CONFIG_API_URL, { authHandlerProvider }))
    .use('verifyEmail', forwardRequest(WEB_CONFIG_API_URL, { authHandlerProvider }))
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
