import { LoginRoute as BaseLoginRoute } from '@tupaia/server-boilerplate';

export class LoginRoute extends BaseLoginRoute {
  // @ts-ignore LoginRoute types cannot be extended at this time
  public async buildResponse() {
    const { accessPolicy } = this.req;
    const authResponse = await super.buildResponse();
    // Reassign the access policy to the user with a more sufficient one
    authResponse.user.accessPolicy = accessPolicy.policy;

    return authResponse;
  }
}
