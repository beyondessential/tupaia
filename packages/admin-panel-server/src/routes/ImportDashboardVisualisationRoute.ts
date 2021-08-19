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
  DraftDashboardItemValidator,
  DraftReportValidator,
} from '../viz-builder';

export class ImportDashboardVisualisationRoute extends Route {
  private readonly meditrakConnection: MeditrakConnection;

  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.meditrakConnection = new MeditrakConnection(req.session);
  }

  public async buildResponse() {
    if (!this.req.file) {
      throw new UploadError();
    }

    const visualisation = readJsonFile(this.req.file.path);
    fs.unlinkSync(this.req.file.path);

    const dashItemValidator = new DraftDashboardItemValidator();
    const reportValidator = new DraftReportValidator();
    const extractor = new DashboardVisualisationExtractor(
      visualisation,
      dashItemValidator,
      reportValidator,
    );
    const body = extractor.extractDashboardVisualisationResource();
    const existingId = await this.findExistingVisualisationId(visualisation);

    const id = existingId
      ? await this.updateVisualisation(existingId, body)
      : await this.createVisualisation(body);
    const action = existingId ? 'updated' : 'created';

    return { id, message: `Visualisation ${action} successfully` };
  }

  private findExistingVisualisationId = async (visualisation: Record<string, string>) => {
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
