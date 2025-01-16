import { AuthHandler } from '../types';
import { createBasicHeader } from '@tupaia/utils';

export class BasicAuthHandler implements AuthHandler {
  private readonly authHeader: string;

  public constructor(username: string, password: string) {
    this.authHeader = this.buildAuthHeader(username, password);
  }

  public async getAuthHeader() {
    return this.authHeader;
  }

  private buildAuthHeader(username: string, password: string): string {
    return createBasicHeader(username, password);
  }
}
