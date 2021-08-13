/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { MicroserviceApi } from './types';
import { AuthHandler } from '../types';
import { ApiConnection } from './ApiConnection';

/**
 * TODO: make internal, do not export from package
 */
export class ApiConnectionBuilder {
  private authHandler?: AuthHandler;

  public handleAuthWith(authHandler: AuthHandler) {
    this.authHandler = authHandler;
    return this;
  }

  public buildAs<Wrapper extends MicroserviceApi>(
    WrapperClazz: new (apiConnection: ApiConnection) => Wrapper,
  ) {
    if (!this.authHandler) {
      throw new Error('Must specify an authHandler when building an ApiConnection');
    }

    const apiConnection = new ApiConnection(this.authHandler);
    const wrappedApiConnection = new WrapperClazz(apiConnection);
    apiConnection.baseUrl = wrappedApiConnection.baseUrl;
    return wrappedApiConnection;
  }
}
