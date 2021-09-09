/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';
import { keyBy } from 'lodash';

import { camelKeys } from '@tupaia/utils';
import { Route } from '@tupaia/server-boilerplate';
import { MeditrakConnection } from '../connections';
import { DashboardVisualisationCombiner, DashboardVisualisationObject } from '../viz-builder';
import {
  Dashboard,
  DashboardRecord,
  DashboardItemRecord,
  DashboardRelationObject,
  DashboardRelationRecord,
} from '../viz-builder/types';

export type ExportDashboardVisualisationRequest = Request<
  { dashboardVisualisationId?: string },
  { contents: DashboardVisualisationObject; filePath: string; type: string },
  { visualisation: DashboardVisualisationObject },
  Record<string, any>
>;

export class ExportDashboardVisualisationRoute extends Route<ExportDashboardVisualisationRequest> {
  protected readonly type = 'download';

  private readonly meditrakConnection: MeditrakConnection;

  constructor(req: ExportDashboardVisualisationRequest, res: Response, next: NextFunction) {
    super(req, res, next);

    this.meditrakConnection = new MeditrakConnection(req.session);
  }

  async buildResponse() {
    this.validate();

    const { visualisation: builtVisualisation } = this.req.body;

    const dashboardItem = await this.findExistingDashboardItem();
    const visualisation =
      builtVisualisation || (await this.buildDashboardItemVisualisation(dashboardItem));
    const fileBaseName = visualisation.code || 'new_dashboard_visualisation';

    const { id, ...visualisationWithoutId } = visualisation;
    const { dashboards, dashboardRelations } = await this.buildDashboardsAndRelations(
      dashboardItem,
    );

    return {
      contents: {
        ...visualisationWithoutId,
        dashboards,
        dashboardRelations,
      },
      filePath: `${fileBaseName}.json`,
      type: '.json',
    };
  }

  private validate = () => {
    const { dashboardVisualisationId } = this.req.params;
    const { visualisation } = this.req.body;

    if (!dashboardVisualisationId && !visualisation) {
      throw new Error('You must provide either a visualisation id or a visualisation object');
    }
    if (dashboardVisualisationId && visualisation) {
      throw new Error(
        'Both visualisation id and visualisation object provided, must provide one or the other',
      );
    }
    if (visualisation && !visualisation.code) {
      throw new Error('Visualisation object must have a code');
    }
  };

  private findExistingDashboardItem = async (): Promise<DashboardItemRecord> => {
    const { dashboardVisualisationId } = this.req.params;

    if (dashboardVisualisationId) {
      const dashboardItem = await this.meditrakConnection.fetchResources(
        `dashboardItems/${dashboardVisualisationId}`,
      );
      if (!dashboardItem) {
        // We assert that the record exists, since a specific id was provided
        throw new Error(`Could not find visualisation with id ${dashboardVisualisationId}`);
      }
      return dashboardItem;
    }

    const { code } = this.req.body.visualisation;
    const [dashboardItem] = await this.meditrakConnection.fetchResources('dashboardItems', {
      filter: {
        code,
      },
    });
    return dashboardItem;
  };

  private buildDashboardItemVisualisation = async (dashboardItem: DashboardItemRecord) => {
    if (dashboardItem.legacy) {
      return dashboardItem;
    }

    const visualisation = await this.meditrakConnection.fetchResources(
      `dashboardVisualisations/${dashboardItem.id}`,
    );
    const combiner = new DashboardVisualisationCombiner(
      visualisation.dashboardItem,
      visualisation.report,
    );
    return combiner.getVisualisation();
  };

  private buildDashboardsAndRelations = async (dashboardItem: DashboardItemRecord) => {
    if (!dashboardItem) {
      return { dashboards: [], dashboardRelations: [] };
    }

    const relationRecords: DashboardRelationRecord[] = await this.meditrakConnection.fetchResources(
      `dashboardItems/${dashboardItem.id}/dashboardRelations`,
    );
    const dashboardIds = relationRecords.map(dr => dr.dashboard_id);
    const dashboardRecords: DashboardRecord[] = await this.meditrakConnection.fetchResources(
      'dashboards',
      {
        filter: {
          id: dashboardIds,
        },
      },
    );
    const dashboardsById = keyBy(dashboardRecords, 'id');

    const dashboards = dashboardRecords.map(({ id, ...dashboard }) => camelKeys(dashboard));
    const dashboardRelations = relationRecords.map(
      ({ id, child_id, dashboard_id: dashboardId, ...dashboardRelation }) =>
        camelKeys({
          dashboardCode: dashboardsById[dashboardId]?.code,
          ...dashboardRelation,
        }),
    );

    return {
      dashboards: dashboards as Dashboard[],
      dashboardRelations: dashboardRelations as DashboardRelationObject[],
    };
  };
}
