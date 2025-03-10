import { Request, Response, NextFunction } from 'express';
import { AuthConnection, AuthResponse } from '../auth';
import { Route } from '../../routes';
import { EmptyObject } from '../../types';
import { RequestResetPasswordCredentials } from '../types';

export interface RequestResetPasswordRequest
  extends Request<EmptyObject, AuthResponse, RequestResetPasswordCredentials> {}

export class RequestResetPasswordRoute extends Route<RequestResetPasswordRequest> {
  private authConnection: AuthConnection;

  public constructor(req: RequestResetPasswordRequest, res: Response, next: NextFunction) {
    super(req, res, next);

    this.authConnection = new AuthConnection();
  }

  public async buildResponse() {
    const credentials = this.req.body;

    return this.authConnection.requestResetPassword(credentials);
  }
}
