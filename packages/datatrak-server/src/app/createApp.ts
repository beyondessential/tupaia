/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import { TupaiaDatabase } from '@tupaia/database';
import { OrchestratorApiBuilder, handleWith } from '@tupaia/server-boilerplate';
import { authHandlerProvider } from '../auth';
import { DatatrakSessionModel } from '../models';
import {
  FetchEntitiesRequest,
  FetchEntitiesRoute,
  FetchProjectsRequest,
  FetchProjectsRoute,
  FetchSurveyScreenComponentsRequest,
  FetchSurveyScreenComponentsRoute,
  FetchSurveysRequest,
  FetchSurveysRoute,
  FetchUserRequest,
  FetchUserRoute,
} from '../routes';

/**
 * Set up express server with middleware,
 */
export function createApp(database = new TupaiaDatabase()) {
  const app = new OrchestratorApiBuilder(database, 'datatrak')
    .useSessionModel(DatatrakSessionModel)
    .attachApiClientToContext(authHandlerProvider)
    .get<FetchEntitiesRequest>('entities/:hierarchy', handleWith(FetchEntitiesRoute))
    .get<FetchProjectsRequest>('projects', handleWith(FetchProjectsRoute))
    .get<FetchSurveysRequest>('surveys', handleWith(FetchSurveysRoute))
    .get<FetchUserRequest>('user', handleWith(FetchUserRoute))
    .get<FetchSurveyScreenComponentsRequest>(
      'surveys/:surveyCode/surveyScreenComponents',
      handleWith(FetchSurveyScreenComponentsRoute),
    )
    .build();

  return app;
}
