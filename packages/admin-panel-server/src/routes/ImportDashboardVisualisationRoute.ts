/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import assert from 'assert';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';

import { Route } from '@tupaia/server-boilerplate';
import { readJsonFile, reduceToDictionary, snakeKeys, UploadError, yup } from '@tupaia/utils';

import { MeditrakConnection } from '../connections';
import {
  dashboardValidator,
  dashboardRelationObjectValidator,
  DashboardVisualisationExtractor,
  draftDashboardItemValidator,
  draftReportValidator,
  legacyReportValidator,
  PreviewMode,
} from '../viz-builder';
import type {
  Dashboard,
  DashboardRecord,
  DashboardRelation,
  DashboardRelationRecord,
  DashboardVizResource,
} from '../viz-builder';

const importFileSchema = yup.object().shape(
  {
    dashboards: yup.array().of(dashboardValidator),
    dashboardRelations: yup.array().of(dashboardRelationObjectValidator),
    // ...the rest of the fields belong to the visualisation object and are validated separately
  },
  [['dashboards', 'dashboardRelations']],
);

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

    const { dashboards = [], dashboardRelations = [], ...visualisation } = this.readFileContents();

    const reportValidator = visualisation?.legacy ? legacyReportValidator : draftReportValidator;
    const extractor = new DashboardVisualisationExtractor(
      visualisation,
      draftDashboardItemValidator,
      reportValidator,
    );
    const extractedViz = extractor.getDashboardVisualisationResource(PreviewMode.PRESENTATION);
    const existingId = await this.findExistingVisualisationId(visualisation);

    const id = existingId
      ? await this.updateVisualisation(existingId, extractedViz)
      : await this.createVisualisation(extractedViz);

    await this.upsertDashboardsAndRelations(id, dashboards, dashboardRelations);

    const action = existingId ? 'updated' : 'created';
    return { id, message: `Visualisation ${action} successfully` };
  }

  private readFileContents = () => {
    const { path } = this.req.file as { path: string };
    const fileContents = readJsonFile<Record<string, unknown>>(path);
    fs.unlinkSync(path);

    return importFileSchema.validateSync(fileContents);
  };

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

  private createVisualisation = async (visualisation: DashboardVizResource) => {
    await this.meditrakConnection.createResource('dashboardVisualisations', {}, visualisation);
    const [viz]: DashboardVizResource[] = await this.meditrakConnection.fetchResources(
      'dashboardVisualisations',
      {
        filter: {
          code: visualisation.dashboardItem.code,
        },
      },
    );

    if (!viz) {
      throw new Error('Could not create visualisation');
    }
    return viz.dashboardItem.id;
  };

  private updateVisualisation = async (vizId: string, visualisation: Record<string, unknown>) => {
    await this.meditrakConnection.updateResource(
      `dashboardVisualisations/${vizId}`,
      {},
      visualisation,
    );
    return vizId;
  };

  private upsertDashboardsAndRelations = async (
    vizId: string,
    dashboards: Dashboard[],
    dashboardRelations: DashboardRelation[],
  ) => {
    await this.upsertDashboards(dashboards.map(d => snakeKeys(d)));
    const dashboardRecords = await this.meditrakConnection.fetchResources('dashboards', {
      filter: {
        code: dashboardRelations.map(dr => dr.dashboardCode),
      },
    });
    const dashboardCodeToId = reduceToDictionary(dashboardRecords, 'code', 'id');

    const relationsToUpsert = dashboardRelations.map(({ dashboardCode, ...dashboardRelation }) => {
      const dashboardId = dashboardCodeToId[dashboardCode];
      assert.ok(dashboardId, `Could not find id for dashboard with code ${dashboardCode}`);
      return snakeKeys({
        ...dashboardRelation,
        dashboard_id: dashboardId,
        child_id: vizId,
      });
    });
    await this.upsertDashboardRelations(relationsToUpsert);
  };

  private upsertDashboards = async (dashboards: DashboardRecord[]) =>
    Promise.all(
      dashboards.map(dashboard =>
        this.meditrakConnection.upsertResource(
          'dashboards',
          {
            filter: {
              code: dashboard.code,
            },
          },
          dashboard,
        ),
      ),
    );

  private upsertDashboardRelations = async (dashboardRelations: DashboardRelationRecord[]) =>
    Promise.all(
      dashboardRelations.map(relation =>
        this.meditrakConnection.upsertResource(
          'dashboardRelations',
          {
            filter: {
              dashboard_id: relation.dashboard_id,
              child_id: relation.child_id,
            },
          },
          relation,
        ),
      ),
    );
}
