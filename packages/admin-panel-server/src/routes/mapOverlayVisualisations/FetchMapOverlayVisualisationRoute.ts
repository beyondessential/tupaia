/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';

import { Route } from '@tupaia/server-boilerplate';

import { MeditrakConnection } from '../../connections';
import { combineMapOverlayVisualisation, MapOverlayViz } from '../../viz-builder';

export type FetchMapOverlayVisualisationRequest = Request<
  { mapOverlayVisualisationId: string },
  { visualisation: MapOverlayViz },
  Record<string, never>,
  Record<string, never>
>;

export class FetchMapOverlayVisualisationRoute extends Route<FetchMapOverlayVisualisationRequest> {
  private readonly meditrakConnection: MeditrakConnection;

  constructor(req: FetchMapOverlayVisualisationRequest, res: Response, next: NextFunction) {
    super(req, res, next);

    this.meditrakConnection = new MeditrakConnection(req.session);
  }

  async buildResponse() {
    const { mapOverlayVisualisationId } = this.req.params;
    const visualisationResource = await this.meditrakConnection.fetchResources(
      `mapOverlayVisualisations/${mapOverlayVisualisationId}`,
    );
    const visualisation = combineMapOverlayVisualisation(visualisationResource);

    return { visualisation };
  }
}
