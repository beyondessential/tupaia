import { ApiConnection } from './ApiConnection';

export class BaseApi {
  protected readonly connection: ApiConnection;

  public constructor(connection: ApiConnection) {
    this.connection = connection;
  }
}
