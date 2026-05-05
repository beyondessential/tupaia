import { AccessPolicy } from '@tupaia/access-policy';
import { TupaiaApiClient } from '@tupaia/api-client';

import { AdminPanelSessionRecord } from '../../models';
import { PromptManager } from '../../viz-builder/prompts/PromptManager';

declare global {
  namespace Express {
    export interface Request {
      accessPolicy: AccessPolicy;
      session: AdminPanelSessionRecord;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      models: any;
      ctx: {
        services: TupaiaApiClient;
        promptManager: PromptManager;
      };
    }
  }
}
