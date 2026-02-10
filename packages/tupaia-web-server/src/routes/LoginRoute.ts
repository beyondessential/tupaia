import {
  LoginRoute as BaseLoginRoute,
  LoginRequest as BaseLoginRequest,
} from '@tupaia/server-boilerplate';
import { getProjectById } from '../utils';

export type LoginRequest = BaseLoginRequest;

type UserResponse = Record<string, any>;

export class LoginRoute extends BaseLoginRoute {
  // @ts-ignore LoginRoute types cannot be extended at this time
  public async buildResponse() {
    const authResponse = await super.buildResponse();
    const user: UserResponse = authResponse.user;

    const projectId = user?.preferences?.project_id;
    if (projectId) {
      user.project = await getProjectById(this.req, projectId);
    }
    return user;
  }
}
