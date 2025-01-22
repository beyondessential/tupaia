import { AuthHandler } from '../types';

export class ForwardingAuthHandler implements AuthHandler {
  private readonly authHeader: string;

  public constructor(authHeader = '') {
    this.authHeader = authHeader;
  }

  public async getAuthHeader() {
    return this.authHeader;
  }
}
