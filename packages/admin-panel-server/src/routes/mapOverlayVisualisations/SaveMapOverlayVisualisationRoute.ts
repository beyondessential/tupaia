/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';

import {
  MapOverlayVisualisationExtractor,
  draftMapOverlayValidator,
  draftReportValidator,
} from '../../viz-builder';

export type SaveMapOverlayVisualisationRequest = Request<
  { mapOverlayVisualisationId?: string },
  { id: string; message: string },
  { visualisation?: Record<string, unknown> },
  Record<string, never>
>;

export class SaveMapOverlayVisualisationRoute extends Route<SaveMapOverlayVisualisationRequest> {
  public async buildResponse() {
    const { visualisation } = this.req.body;
    const { mapOverlayVisualisationId } = this.req.params;
    const { central: centralApi } = this.req.ctx.services;

    if (!visualisation) {
      throw new Error('Visualisation cannot be empty.');
    }

    const extractor = new MapOverlayVisualisationExtractor(
      visualisation,
      draftMapOverlayValidator,
      draftReportValidator,
    );
    const body = extractor.getMapOverlayVisualisationResource();

    let result;

    // Update visualisation if id exists
    if (mapOverlayVisualisationId) {
      result = await centralApi.updateResource(
        `mapOverlayVisualisations/${mapOverlayVisualisationId}`,
        {},
        body,
      );
    } else {
      result = await centralApi.createResource('mapOverlayVisualisations', {}, body);
    }

    return {
      id: mapOverlayVisualisationId || result.mapOverlay?.id,
      message: 'Visualisation saved successfully',
    };
  }
}
