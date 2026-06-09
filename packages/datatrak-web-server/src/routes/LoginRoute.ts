import { mergeAccessPolicies } from '@tupaia/auth';
import { LoginRoute as BaseLoginRoute } from '@tupaia/server-boilerplate';

export class LoginRoute extends BaseLoginRoute {
  // @ts-ignore LoginRoute types cannot be extended at this time
  public async buildResponse() {
    const authResponse = await super.buildResponse();
    const { accessPolicy } = this.req;

    // Reassign the access policy to the user with a more sufficient one
    authResponse.user.accessPolicy = this.req.session
      ? mergeAccessPolicies(this.req.session.accessPolicy.policy, accessPolicy.policy)
      : accessPolicy.policy;

    return authResponse;
  }
}
