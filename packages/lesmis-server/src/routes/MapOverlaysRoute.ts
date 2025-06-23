import { Request, NextFunction } from 'express';
import { TranslatableRoute, TranslatableResponse } from '@tupaia/server-boilerplate';
import { LESMIS_PROJECT_NAME } from '../constants';

export type MapOverlaysRequest = Request<{ entityCode: string }, any, any, any>;

export class MapOverlaysRoute extends TranslatableRoute<
  MapOverlaysRequest,
  TranslatableResponse<MapOverlaysRequest>
> {
  public constructor(
    req: MapOverlaysRequest,
    res: TranslatableResponse<MapOverlaysRequest>,
    next: NextFunction,
  ) {
    super(req, res, next);

    this.translationSchema = {
      domain: 'lesmis',
      layout: {
        type: 'array',
        items: {
          type: 'object',
          valuesToTranslate: ['name'],
          properties: {
            // Object property named 'children'
            children: {
              type: 'array',
              items: {
                type: 'object',
                // Map overlays
                valuesToTranslate: ['name'],
                properties: {
                  values: {
                    type: 'array',
                    items: {
                      type: 'object',
                      keysToTranslate: ['name', 'value'],
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
  }

  public async buildResponse() {
    const { entityCode } = this.req.params;
    return this.req.ctx.services.webConfig.fetchMapOverlays({
      organisationUnitCode: entityCode,
      projectCode: LESMIS_PROJECT_NAME,
    });
  }
}
