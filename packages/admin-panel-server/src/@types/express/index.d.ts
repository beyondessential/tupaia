import { AccessPolicy } from '@tupaia/access-policy';
import { TupaiaApiClient } from '@tupaia/api-client';
import {
  ProjectModel,
  ServerBoilerplateModelRegistry,
  SurveyModel,
  SurveyResponseModel,
} from '@tupaia/server-boilerplate';

import { AdminPanelSessionRecord } from '../../models';
import { PromptManager } from '../../viz-builder/prompts/PromptManager';

declare global {
  namespace Express {
    export interface Request {
      accessPolicy: AccessPolicy;
      session: AdminPanelSessionRecord;
      models: ServerBoilerplateModelRegistry & {
        readonly project: ProjectModel;
        readonly survey: SurveyModel;
        readonly surveyResponse: SurveyResponseModel;
      };
      ctx: {
        services: TupaiaApiClient;
        promptManager: PromptManager;
      };
    }
  }
}
