import { Route } from '@tupaia/server-boilerplate';
import { formatEntitiesForResponse } from './format';
import { MultiEntityRequest } from './types';

export class MultiEntityRoute extends Route<MultiEntityRequest> {
  public async buildResponse() {
    const { entities, field, fields } = this.req.ctx;
    return formatEntitiesForResponse(this.req.models, this.req.ctx, entities, field || fields);
  }
}
