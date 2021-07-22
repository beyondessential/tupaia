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
import { DraftReportExtractor, DraftDashboardItemExtractor } from '../viz-builder';

export class SaveDashboardVisualisation extends Route {
  private readonly meditrakConnection: MeditrakConnection;

  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.meditrakConnection = new MeditrakConnection(req.session);
  }

  async buildResponse() {
    const { visualisation } = this.req.body;
    if (!visualisation) {
      throw new Error('Visualisation is empty');
    }

    const report = new DraftReportExtractor(visualisation).extract();
    const dashboardItem = new DraftDashboardItemExtractor(visualisation).extract();

    // snake case the property names because meditrak-server POST endpoints
    // should ideally receive the data in the right format to insert
    const body = {
      report: mapKeys(report, (_, propertyKey: string) => snake(propertyKey)),
      dashboardItem: mapKeys(dashboardItem, (_, propertyKey: string) => snake(propertyKey)),
    };

    return this.meditrakConnection.createResource('dashboardVisualisations', {}, body);
  }
}
