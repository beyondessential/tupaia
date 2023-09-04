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
  SurveyScreenComponentsRoute,
  SurveyScreenComponentsRequest,
  SurveyRequest,
  SurveyRoute,
} from '../routes';

const { CENTRAL_API_URL = 'http://localhost:8090/v2' } = process.env;

const authHandlerProvider = (req: Request) => new SessionSwitchingAuthHandler(req);

export function createApp() {
  const app = new OrchestratorApiBuilder(new TupaiaDatabase(), 'datatrak-web-server')
    .useSessionModel(DataTrakSessionModel)
    .useAttachSession(attachSessionIfAvailable)
    .attachApiClientToContext(authHandlerProvider)
    .get<UserRequest>('getUser', handleWith(UserRoute))
    .get<SurveysRequest>('surveys', handleWith(SurveysRoute))
    .get<SurveyRequest>('surveys/:surveyCode', handleWith(SurveyRoute))
    .get<SurveyScreenComponentsRequest>(
      'surveys/:surveyCode/surveyScreenComponents',
      handleWith(SurveyScreenComponentsRoute),
    )
    // Forward everything else to central server
    .use('*', forwardRequest(CENTRAL_API_URL, { authHandlerProvider }))
    .build();

  return app;
}
