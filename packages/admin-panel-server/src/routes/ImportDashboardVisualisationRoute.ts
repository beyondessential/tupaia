/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';
import fs from 'fs';

import { Route } from '@tupaia/server-boilerplate';
import { readJsonFile, UploadError } from '@tupaia/utils';

import { MeditrakConnection } from '../connections';
import {
  DashboardVisualisationExtractor,
  draftDashboardItemValidator,
  draftReportValidator,
} from '../viz-builder';

export type ImportDashboardVisualisationRequest = Request<
  Record<string, never>,
  { id: string; message: string },
  Record<string, never>,
  Record<string, never>
>;

export class ImportDashboardVisualisationRoute extends Route<ImportDashboardVisualisationRequest> {
  private readonly meditrakConnection: MeditrakConnection;

  constructor(req: ImportDashboardVisualisationRequest, res: Response, next: NextFunction) {
    super(req, res, next);

    this.meditrakConnection = new MeditrakConnection(req.session);
  }

  public async buildResponse() {
    if (!this.req.file) {
      throw new UploadError();
    }

    const visualisation = readJsonFile<Record<string, unknown>>(this.req.file.path);
    fs.unlinkSync(this.req.file.path);

    const extractor = new DashboardVisualisationExtractor(
      visualisation,
      draftDashboardItemValidator,
      draftReportValidator,
    );
    const body = extractor.getDashboardVisualisationResource();
    const existingId = await this.findExistingVisualisationId(visualisation);

    const id = existingId
      ? await this.updateVisualisation(existingId, body)
      : await this.createVisualisation(body);
    const action = existingId ? 'updated' : 'created';

    return { id, message: `Visualisation ${action} successfully` };
  }

  private findExistingVisualisationId = async (visualisation: Record<string, unknown>) => {
    const { id, code } = visualisation;

    const [viz] = await this.meditrakConnection.fetchResources('dashboardVisualisations', {
      filter: {
        id: id ?? undefined,
        code,
      },
    });
    return viz?.dashboardItem?.id;
  };

  private createVisualisation = async (visualisation: Record<string, unknown>) => {
    const { id } = await this.meditrakConnection.createResource(
      'dashboardVisualisations',
      {},
      visualisation,
    );
    return id;
  };

  private updateVisualisation = async (vizId: string, visualisation: Record<string, unknown>) => {
    await this.meditrakConnection.updateResource(
      `dashboardVisualisations/${vizId}`,
      {},
      visualisation,
    );
    return vizId;
  };
}
