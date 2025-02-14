import { Route } from './Route';

export class TestRoute extends Route {
  public async buildResponse() {
    return { hello: 'world' };
  }
}
