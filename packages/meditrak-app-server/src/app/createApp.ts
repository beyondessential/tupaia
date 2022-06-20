/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { TupaiaDatabase } from '@tupaia/database';
import { handleWith, MicroServiceApiBuilder } from '@tupaia/server-boilerplate';
import {
  AuthRequest,
  AuthRoute,
  ChangePasswordRequest,
  ChangePasswordRoute,
  RegisterUserRequest,
  RegisterUserRoute,
  SocialFeedRequest,
  SocialFeedRoute,
  UserRewardsRequest,
  UserRewardsRoute,
} from '../routes';
import { authHandlerProvider, buildAuthMiddleware } from '../auth';

/**
 * Set up express server with middleware,
 */
export function createApp(database = new TupaiaDatabase()) {
  const authMiddleware = buildAuthMiddleware(database);
  const app = new MicroServiceApiBuilder(database, 'meditrak')
    .attachApiClientToContext(authHandlerProvider)
    .post<AuthRequest>('auth', handleWith(AuthRoute))
    .post<RegisterUserRequest>('user', handleWith(RegisterUserRoute))
    .get<SocialFeedRequest>('socialFeed', authMiddleware, handleWith(SocialFeedRoute))
    .get<UserRewardsRequest>('me/rewards', authMiddleware, handleWith(UserRewardsRoute))
    .post<ChangePasswordRequest>(
      'me/changePassword',
      authMiddleware,
      handleWith(ChangePasswordRoute),
    )
    .build();

  return app;
}
