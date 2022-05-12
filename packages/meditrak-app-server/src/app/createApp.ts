/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { TupaiaDatabase } from '@tupaia/database';
import { handleWith, MicroServiceApiBuilder } from '@tupaia/server-boilerplate';
import {
  AuthRequest,
  AuthRoute,
  RegisterUserRequest,
  RegisterUserRoute,
  SocialFeedRequest,
  SocialFeedRoute,
} from '../routes';
import { authHandlerProvider, buildAuthMiddleware } from '../auth';

/**
 * Set up express server with middleware,
 */
export function createApp() {
  const database = new TupaiaDatabase();
  const authMiddleware = buildAuthMiddleware(database);
  const app = new MicroServiceApiBuilder(database)
    .attachApiClientToContext(authHandlerProvider)
    .post<AuthRequest>('auth', handleWith(AuthRoute))
    .post<RegisterUserRequest>('user', handleWith(RegisterUserRoute))
    .get<SocialFeedRequest>('socialFeed', authMiddleware, handleWith(SocialFeedRoute))
    .build();

  return app;
}
