/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';

import { Route } from '@tupaia/server-boilerplate';

import { CentralConnection } from '../../connections';
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
  private readonly centralConnection: CentralConnection;

  public constructor(req: SaveMapOverlayVisualisationRequest, res: Response, next: NextFunction) {
    super(req, res, next);

    this.centralConnection = new CentralConnection(req.session);
  }

  public async buildResponse() {
    const { visualisation } = this.req.body;
    const { mapOverlayVisualisationId } = this.req.params;

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
      result = await this.centralConnection.updateResource(
        `mapOverlayVisualisations/${mapOverlayVisualisationId}`,
        {},
        body,
      );
    } else {
      result = await this.centralConnection.createResource('mapOverlayVisualisations', {}, body);
    }

    return {
      id: mapOverlayVisualisationId || result.mapOverlay?.id,
      message: 'Visualisation saved successfully',
    };
  }
}
