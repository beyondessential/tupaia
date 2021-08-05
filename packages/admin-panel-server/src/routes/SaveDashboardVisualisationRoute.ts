/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';
import { snake } from 'case';
import { mapKeys } from 'lodash';

import { Route } from '@tupaia/server-boilerplate';

import { MeditrakConnection } from '../connections';
import { DashboardVisualisationExtractor } from '../viz-builder';
import {
  DraftDashboardItemValidator,
  DraftReportValidator,
} from '../viz-builder/extractors/validators';

export class SaveDashboardVisualisationRoute extends Route {
  private readonly meditrakConnection: MeditrakConnection;

  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.meditrakConnection = new MeditrakConnection(req.session);
  }

  async buildResponse() {
    const { visualisation } = this.req.body;
    if (!visualisation) {
      throw new Error('Visualisation cannot be empty.');
    }

    const extractor = new DashboardVisualisationExtractor(
      visualisation,
      new DraftDashboardItemValidator(),
      new DraftReportValidator(),
    );
    const report = extractor.getReport();
    const dashboardItem = extractor.getDashboardItem();

    // snake case the property names because meditrak-server POST endpoints
    // should ideally receive the data in the right format to insert
    const body = {
      report: mapKeys(report, (_, propertyKey: string) => snake(propertyKey)),
      dashboardItem: mapKeys(dashboardItem, (_, propertyKey: string) => snake(propertyKey)),
    };
  
    let result;

    // Update visualisation if id exists
    if (visualisation.id) {
      result = await this.meditrakConnection.updateResource(`dashboardVisualisations/${visualisation.id}`, {}, body);
    } else {
      result = await this.meditrakConnection.createResource('dashboardVisualisations', {}, body);
    }
   
    return { id: visualisation.id || result.dashboardItem?.id, message: 'Visualisation saved successfully' };
  }
}
