import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebGenerateLoginTokenRequest as RequestT } from '@tupaia/types';

export type GenerateLoginTokenRequest = Request<
  RequestT.Params,
  RequestT.ResBody,
  RequestT.ReqBody,
  RequestT.ReqQuery
>;

export class GenerateLoginTokenRoute extends Route<GenerateLoginTokenRequest> {
  public async buildResponse() {
    const { ctx, session } = this.req;
    if (!session) {
      throw new Error('Cannot generate login token without known user');
    }

    const { id: userId } = await ctx.services.central.getUser();
    const oneTimeLogin = await this.req.models.oneTimeLogin.create({ user_id: userId });
    return { token: oneTimeLogin.token };
  }
}
