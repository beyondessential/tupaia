import { Request, NextFunction } from 'express';
import { TranslatableResponse, TranslatableRoute } from '@tupaia/server-boilerplate';
import { LESMIS_PROJECT_NAME } from '../constants';
import { camelcaseKeys } from '@tupaia/tsutils';

export type EntityRequest = Request<{ entityCode: string }, any, any, any>;

export class EntityRoute extends TranslatableRoute<
  EntityRequest,
  TranslatableResponse<EntityRequest>
> {
  public constructor(
    req: EntityRequest,
    res: TranslatableResponse<EntityRequest>,
    next: NextFunction,
  ) {
    super(req, res, next);

    this.translationSchema = {
      domain: 'lesmis',
      layout: {
        type: 'object',
        valuesToTranslate: ['name'],
      },
    };
  }

  public async buildResponse() {
    const { entityCode } = this.req.params;
    const queryParameters = this.req.query;
    const entity = await this.req.ctx.services.entity.getEntity(
      LESMIS_PROJECT_NAME,
      entityCode,
      queryParameters,
    );

    return camelcaseKeys(entity);
  }
}
