import { Request } from 'express';
import { TupaiaDatabase } from '@tupaia/database';
import {
  OrchestratorApiBuilder,
  SessionSwitchingAuthHandler,
  forwardRequest,
  handleWith,
} from '@tupaia/server-boilerplate';
import { getEnvVarOrDefault } from '@tupaia/utils';
import { LesmisSessionModel } from '../models';
import {
  DashboardRoute,
  EntityRoute,
  EntitiesRoute,
  MapOverlaysRoute,
  RegisterRoute,
  ReportRoute,
  UserRoute,
  VerifyEmailRoute,
  PDFExportRoute,
} from '../routes';
import { attachSession } from '../session';
import { hasLesmisAccess } from '../utils';
import { DashboardRequest } from '../routes/DashboardRoute';
import { UserRequest } from '../routes/UserRoute';
import { EntitiesRequest } from '../routes/EntitiesRoute';
import { MapOverlaysRequest } from '../routes/MapOverlaysRoute';
import { EntityRequest } from '../routes/EntityRoute';
import { ReportRequest } from '../routes/ReportRoute';
import { VerifyEmailRequest } from '../routes/VerifyEmailRoute';
import { RegisterRequest } from '../routes/RegisterRoute';
import { PDFExportRequest } from '../routes/PDFExportRoute';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

const authHandlerProvider = (req: Request) => new SessionSwitchingAuthHandler(req);

/**
 * Set up express server with middleware,
 */
export async function createApp() {
  const CENTRAL_API_URL = getEnvVarOrDefault('CENTRAL_API_URL', 'http://localhost:8090/v2');
  const builder = new OrchestratorApiBuilder(new TupaiaDatabase(), 'lesmis')
    .useSessionModel(LesmisSessionModel)
    .useAttachSession(attachSession)
    .attachApiClientToContext(authHandlerProvider)
    .verifyLogin(hasLesmisAccess)
    .useTranslation(['en', 'lo'], path.join(__dirname, '../../locales'), 'locale')

    /**
     * GET
     */
    .get<DashboardRequest>('dashboard/:entityCode', handleWith(DashboardRoute))
    .get<UserRequest>('user', handleWith(UserRoute))
    .get<EntitiesRequest>('entities/:entityCode', handleWith(EntitiesRoute))
    .get<MapOverlaysRequest>('map-overlays/:entityCode', handleWith(MapOverlaysRoute))
    .get<EntityRequest>('entity/:entityCode', handleWith(EntityRoute))
    .get<ReportRequest>('report/:entityCode/:reportCode', handleWith(ReportRoute))
    .get<VerifyEmailRequest>('verify/:emailToken', handleWith(VerifyEmailRoute))

    /**
     * POST
     */
    .post<RegisterRequest>('register', handleWith(RegisterRoute))
    .post<ReportRequest>('report/:entityCode/:reportCode', handleWith(ReportRoute))
    .post<PDFExportRequest>('pdf', handleWith(PDFExportRoute))

    .use('*', forwardRequest(CENTRAL_API_URL));

  const app = builder.build();

  await builder.initialiseApiClient([
    {
      entityCode: 'LA',
      permissionGroupName: 'LESMIS Public',
    },
  ]);

  return app;
}
