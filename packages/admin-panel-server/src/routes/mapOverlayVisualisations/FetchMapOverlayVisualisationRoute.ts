/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';

import { Route } from '@tupaia/server-boilerplate';

import { CentralConnection } from '../../connections';
import { combineMapOverlayVisualisation, MapOverlayViz } from '../../viz-builder';

export type FetchMapOverlayVisualisationRequest = Request<
  { mapOverlayVisualisationId: string },
  { visualisation: MapOverlayViz },
  Record<string, never>,
  Record<string, never>
>;

export class FetchMapOverlayVisualisationRoute extends Route<FetchMapOverlayVisualisationRequest> {
  private readonly centralConnection: CentralConnection;

  public constructor(req: FetchMapOverlayVisualisationRequest, res: Response, next: NextFunction) {
    super(req, res, next);

    this.centralConnection = new CentralConnection(req.session);
  }

  public async buildResponse() {
    const { mapOverlayVisualisationId } = this.req.params;
    const visualisationResource = await this.centralConnection.fetchResources(
      `mapOverlayVisualisations/${mapOverlayVisualisationId}`,
    );
    const visualisation = combineMapOverlayVisualisation(visualisationResource);

    return { visualisation };
  }
}
