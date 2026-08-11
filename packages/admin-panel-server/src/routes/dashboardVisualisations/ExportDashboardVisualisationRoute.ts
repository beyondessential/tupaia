import { Request } from 'express';
import { keyBy } from 'es-toolkit/compat';

import { camelKeys } from '@tupaia/utils';
import { Route } from '@tupaia/server-boilerplate';
import { combineDashboardVisualisation } from '../../viz-builder';
import type {
  Dashboard,
  DashboardItemRecord,
  DashboardRecord,
  DashboardRelation,
  DashboardRelationRecord,
  DashboardVizResource,
  DashboardViz,
} from '../../viz-builder';

export type ExportDashboardVisualisationRequest = Request<
  { dashboardVisualisationId?: string },
  { contents: Omit<DashboardViz, 'latestDataParameters'>; filePath: string; type: string },
  { visualisation: DashboardViz },
  Record<string, any>
>;

export class ExportDashboardVisualisationRoute extends Route<ExportDashboardVisualisationRequest> {
  protected readonly type = 'download';

  public async buildResponse() {
    this.validate();

    const { visualisation: builtVisualisation } = this.req.body;

    const dashboardItem = await this.findExistingDashboardItem();
    const visualisation =
      builtVisualisation || (await this.buildDashboardItemVisualisation(dashboardItem));
    const fileBaseName = visualisation.code || 'new_dashboard_visualisation';

    const { id, latestDataParameters, ...visualisationWithoutIdAndLatestParams } = visualisation;
    const { dashboards, dashboardRelations } =
      await this.buildDashboardsAndRelations(dashboardItem);

    return {
      contents: {
        ...visualisationWithoutIdAndLatestParams,
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
    const { central: centralApi } = this.req.ctx.services;

    if (dashboardVisualisationId) {
      const dashboardItem = await centralApi.fetchResources(
        `dashboardItems/${dashboardVisualisationId}`,
      );

      if (!dashboardItem) {
        // We assert that the record exists, since a specific id was provided
        throw new Error(`Could not find visualisation with id ${dashboardVisualisationId}`);
      }
      return dashboardItem;
    }

    const { code } = this.req.body.visualisation;
    const [dashboardItem] = await centralApi.fetchResources('dashboardItems', {
      filter: {
        code,
      },
    });
    return dashboardItem;
  };

  private buildDashboardItemVisualisation = async (dashboardItem: DashboardItemRecord) => {
    const vizResource: DashboardVizResource = await this.req.ctx.services.central.fetchResources(
      `dashboardVisualisations/${dashboardItem.id}`,
    );
    return combineDashboardVisualisation(vizResource);
  };

  private buildDashboardsAndRelations = async (dashboardItem: DashboardItemRecord) => {
    if (!dashboardItem) {
      return { dashboards: [], dashboardRelations: [] };
    }
    const { central: centralApi } = this.req.ctx.services;

    const relationRecords: DashboardRelationRecord[] = await centralApi.fetchResources(
      `dashboardItems/${dashboardItem.id}/dashboardRelations`,
    );
    const dashboardIds = relationRecords.map(dr => dr.dashboard_id);
    const dashboardRecords: DashboardRecord[] = await centralApi.fetchResources('dashboards', {
      filter: {
        id: dashboardIds,
      },
    });
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
      dashboards: dashboards as Omit<Dashboard, 'id'>[],
      dashboardRelations: dashboardRelations as DashboardRelation[],
    };
  };
}
