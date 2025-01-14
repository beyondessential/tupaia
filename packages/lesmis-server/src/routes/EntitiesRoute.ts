import { Request, NextFunction } from 'express';
import { TranslatableResponse, TranslatableRoute } from '@tupaia/server-boilerplate';
import { LESMIS_PROJECT_NAME } from '../constants';
import { camelcaseKeys } from '@tupaia/tsutils';

export type EntitiesRequest = Request<
  { entityCode: string },
  any,
  any,
  { includeRootEntity?: string }
>;

export class EntitiesRoute extends TranslatableRoute<
  EntitiesRequest,
  TranslatableResponse<EntitiesRequest>
> {
  public constructor(
    req: EntitiesRequest,
    res: TranslatableResponse<EntitiesRequest>,
    next: NextFunction,
  ) {
    super(req, res, next);

    this.translationSchema = {
      domain: 'lesmis',
      layout: {
        type: 'array',
        where: entry => entry.type !== 'school', // Schools are always in laotian
        items: {
          type: 'object',
          valuesToTranslate: ['name'],
        },
      },
    };
  }

  public async buildResponse() {
    const { entityCode } = this.req.params;
    const { includeRootEntity: includeRootEntityParam, ...queryParameters } = this.req.query;
    const includeRootEntity =
      includeRootEntityParam !== undefined && includeRootEntityParam.toLocaleLowerCase() === 'true';
    const entities = await this.req.ctx.services.entity.getDescendantsOfEntity(
      LESMIS_PROJECT_NAME,
      entityCode,
      queryParameters,
      includeRootEntity,
    );

    return camelcaseKeys(entities);
  }
}
