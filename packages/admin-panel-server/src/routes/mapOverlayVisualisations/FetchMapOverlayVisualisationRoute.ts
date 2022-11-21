/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';

import { combineMapOverlayVisualisation, MapOverlayViz } from '../../viz-builder';

export type FetchMapOverlayVisualisationRequest = Request<
  { mapOverlayVisualisationId: string },
  { visualisation: MapOverlayViz },
  Record<string, never>,
  Record<string, never>
>;

export class FetchMapOverlayVisualisationRoute extends Route<FetchMapOverlayVisualisationRequest> {
  public async buildResponse() {
    const { mapOverlayVisualisationId } = this.req.params;
    const visualisationResource = await this.req.ctx.services.central.fetchResources(
      `mapOverlayVisualisations/${mapOverlayVisualisationId}`,
    );
    const visualisation = combineMapOverlayVisualisation(visualisationResource);

    return { visualisation };
  }
}
