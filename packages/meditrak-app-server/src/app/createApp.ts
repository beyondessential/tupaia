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
  CountChangesRequest,
  CountChangesRoute,
  PullChangesRequest,
  PullChangesRoute,
  PushChangesRequest,
  PushChangesRoute,
  RegisterUserRequest,
  RegisterUserRoute,
  SocialFeedRequest,
  SocialFeedRoute,
  UserRewardsRequest,
  UserRewardsRoute,
} from '../routes';
import { authHandlerProvider, buildAuthMiddleware } from '../auth';
import { checkAppVersion } from '../middleware';

/**
 * Set up express server with middleware,
 */
export function createApp(database = new TupaiaDatabase()) {
  const authMiddleware = buildAuthMiddleware(database);
  const app = new MicroServiceApiBuilder(database, 'meditrak')
    .attachApiClientToContext(authHandlerProvider)
    .use('*', checkAppVersion)
    .post<AuthRequest>('auth', handleWith(AuthRoute))
    .post<RegisterUserRequest>('user', handleWith(RegisterUserRoute))
    .get<SocialFeedRequest>('socialFeed', authMiddleware, handleWith(SocialFeedRoute))
    .get<UserRewardsRequest>('me/rewards', authMiddleware, handleWith(UserRewardsRoute))
    .post<ChangePasswordRequest>(
      'me/changePassword',
      authMiddleware,
      handleWith(ChangePasswordRoute),
    )
    .get<CountChangesRequest>('changes/count', authMiddleware, handleWith(CountChangesRoute))
    .get<PullChangesRequest>('changes', authMiddleware, handleWith(PullChangesRoute))
    .post<PushChangesRequest>('changes', authMiddleware, handleWith(PushChangesRoute))
    .build();

  return app;
}
