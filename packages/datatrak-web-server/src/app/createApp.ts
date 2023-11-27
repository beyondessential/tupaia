/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { NextFunction, Request, Response } from 'express';
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

export function createApp() {
  const app = new OrchestratorApiBuilder(new TupaiaDatabase(), 'datatrak-web-server', {
    attachModels: true,
  })
    .useSessionModel(DataTrakSessionModel)

    .useAttachSession(attachSessionIfAvailable)
    .attachApiClientToContext(authHandlerProvider)
    .use('*', (req: Request, res: Response, next: NextFunction) => {
      console.log('test');
      const session = req.session;

      if (!session) {
        req.ctx.services.entityPublic = req.ctx.services.entity;
      } else {
        req.entityServerRequestMode = 'public';
      }
      next();
    })
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
    .use('*', forwardRequest(CENTRAL_API_URL, { authHandlerProvider }))
    .build();

  return app;
}
