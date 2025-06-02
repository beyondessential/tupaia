import { Request } from 'express';
import { TupaiaDatabase } from '@tupaia/database';
import {
  attachSessionIfAvailable,
  forwardRequest,
  handleWith,
  OrchestratorApiBuilder,
  SessionSwitchingAuthHandler,
} from '@tupaia/server-boilerplate';
import { getEnvVarOrDefault } from '@tupaia/utils';
import { DataTrakSessionModel } from '../models';
import {
  ActivityFeedRequest,
  ActivityFeedRoute,
  CreateTaskRequest,
  CreateTaskRoute,
  EditTaskRequest,
  EditTaskRoute,
  EntitiesRequest,
  EntitiesRoute,
  EntityDescendantsRequest,
  EntityDescendantsRoute,
  EntityAncestorsRequest,
  EntityAncestorsRoute,
  GenerateLoginTokenRequest,
  GenerateLoginTokenRoute,
  LeaderboardRequest,
  LeaderboardRoute,
  PermissionGroupUsersRequest,
  PermissionGroupUsersRoute,
  ProjectRequest,
  ProjectRoute,
  ProjectsRequest,
  ProjectsRoute,
  RecentSurveysRequest,
  RecentSurveysRoute,
  SingleEntityRequest,
  SingleEntityRoute,
  SingleSurveyResponseRequest,
  SingleSurveyResponseRoute,
  SubmitSurveyResponseRequest,
  SubmitSurveyResponseRoute,
  SurveyRequest,
  SurveyResponsesRequest,
  SurveyResponsesRoute,
  SurveyRoute,
  SurveysRequest,
  SurveysRoute,
  SurveyUsersRequest,
  SurveyUsersRoute,
  TaskMetricsRequest,
  TaskMetricsRoute,
  TaskRequest,
  TaskRoute,
  TasksRequest,
  TasksRoute,
  UserRequest,
  UserRoute,
  ResubmitSurveyResponseRequest,
  ResubmitSurveyResponseRoute,
  ExportSurveyResponseRequest,
  ExportSurveyResponseRoute,
} from '../routes';
import { attachAccessPolicy } from './middleware';
import { API_CLIENT_PERMISSIONS } from '../constants';

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
    // Get Routes
    .get<UserRequest>('getUser', handleWith(UserRoute))
    .get<SingleEntityRequest>('entity/:entityCode', handleWith(SingleEntityRoute))
    .get<EntityDescendantsRequest>('entityDescendants', handleWith(EntityDescendantsRoute))
    .get<EntityAncestorsRequest>(
      'entityAncestors/:projectCode/:rootEntityCode',
      handleWith(EntityAncestorsRoute),
    )
    .get<EntitiesRequest>('entities', handleWith(EntitiesRoute))
    .get<SurveysRequest>('surveys', handleWith(SurveysRoute))
    .get<SurveyResponsesRequest>('surveyResponses', handleWith(SurveyResponsesRoute))
    .get<SurveyRequest>('surveys/:surveyCode', handleWith(SurveyRoute))
    .get<ProjectsRequest>('projects', handleWith(ProjectsRoute))
    .get<LeaderboardRequest>('leaderboard', handleWith(LeaderboardRoute))
    .get<ProjectRequest>('project/:projectCode', handleWith(ProjectRoute))
    .get<RecentSurveysRequest>('recentSurveys', handleWith(RecentSurveysRoute))
    .get<ActivityFeedRequest>('activityFeed', handleWith(ActivityFeedRoute))
    .get<TaskMetricsRequest>('taskMetrics/:projectId', handleWith(TaskMetricsRoute))
    .get<TasksRequest>('tasks', handleWith(TasksRoute))
    .get<TaskRequest>('tasks/:taskId', handleWith(TaskRoute))
    .get<SingleSurveyResponseRequest>('surveyResponse/:id', handleWith(SingleSurveyResponseRoute))
    .get<SurveyUsersRequest>('users/:surveyCode/:countryCode', handleWith(SurveyUsersRoute))
    .get<PermissionGroupUsersRequest>('users/:countryCode', handleWith(PermissionGroupUsersRoute))
    // Post Routes
    .post<CreateTaskRequest>('tasks', handleWith(CreateTaskRoute))
    .put<EditTaskRequest>('tasks/:taskId', handleWith(EditTaskRoute))
    .post<SubmitSurveyResponseRequest>(
      'submitSurveyResponse',
      handleWith(SubmitSurveyResponseRoute),
    )
    .post<ResubmitSurveyResponseRequest>(
      'resubmitSurveyResponse/:originalSurveyResponseId',
      handleWith(ResubmitSurveyResponseRoute),
    )
    .post<GenerateLoginTokenRequest>('generateLoginToken', handleWith(GenerateLoginTokenRoute))
    .post<ExportSurveyResponseRequest>(
      'export/:surveyResponseId',
      handleWith(ExportSurveyResponseRoute),
    )
    // Forward auth requests to web-config
    .use('resendEmail', forwardRequest(WEB_CONFIG_API_URL, { authHandlerProvider }))
    .use('verifyEmail', forwardRequest(WEB_CONFIG_API_URL, { authHandlerProvider }))
    // Forward everything else to central server
    .use('*', forwardRequest(CENTRAL_API_URL, { authHandlerProvider }));

  await builder.initialiseApiClient(API_CLIENT_PERMISSIONS);

  const app = builder.build();
  return app;
}
