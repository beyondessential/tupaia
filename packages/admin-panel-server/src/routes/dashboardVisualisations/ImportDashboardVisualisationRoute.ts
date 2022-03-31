/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import assert from 'assert';
import { Request, Response, NextFunction } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { reduceToDictionary, snakeKeys, UploadError, yup } from '@tupaia/utils';

import { MeditrakConnection } from '../../connections';
import {
  dashboardValidator,
  dashboardRelationObjectValidator,
  DashboardVisualisationExtractor,
  draftDashboardItemValidator,
  legacyDashboardItemValidator,
  draftReportValidator,
  legacyReportValidator,
  UpsertDashboard,
  UpsertDashboardRelation,
} from '../../viz-builder';
import type {
  DashboardRecord,
  DashboardRelationRecord,
  DashboardVizResource,
} from '../../viz-builder';
import { readFileContent } from '../../utils';

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
  { importedVizes: { id: string; code: string }[]; message: string },
  Record<string, never>,
  Record<string, never>
>;

type ImportFileContent = {
  dashboards?: UpsertDashboard[];
  dashboardRelations?: UpsertDashboardRelation[];
} & Record<string, unknown>;

export class ImportDashboardVisualisationRoute extends Route<ImportDashboardVisualisationRequest> {
  private readonly meditrakConnection: MeditrakConnection;

  public constructor(req: ImportDashboardVisualisationRequest, res: Response, next: NextFunction) {
    super(req, res, next);

    this.meditrakConnection = new MeditrakConnection(req.session);
  }

  public async buildResponse() {
    const { files } = this.req;
    if (!files || !Array.isArray(files)) {
      throw new UploadError();
    }

    const importedVizes: { id: string; code: string }[] = [];
    const errors: [string, string][] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const { originalname: fileName } = file;
      try {
        const fileContent = importFileSchema.validateSync(readFileContent(file));
        importedVizes.push(await this.importViz(fileContent));
      } catch (error: any) {
        errors.push([fileName, error.message]);
      }
    }

    if (errors.length > 0) {
      throw new UploadError(
        new Error(errors.map(([fileName, errorMsg]) => `\n  ${fileName}: ${errorMsg}`).join('')),
      );
    }

    return {
      importedVizes,
      message: `${importedVizes.length} dashboard visualisation${
        importedVizes.length !== 1 ? 's' : ''
      } imported successfully`,
    };
  }

  private async importViz(vizConfig: ImportFileContent) {
    const { dashboards = [], dashboardRelations = [], ...visualisation } = vizConfig;

    const [dashboardItemValidator, reportValidator] = visualisation?.legacy
      ? [legacyDashboardItemValidator, legacyReportValidator]
      : [draftDashboardItemValidator, draftReportValidator];
    const extractor = new DashboardVisualisationExtractor(
      visualisation,
      dashboardItemValidator,
      reportValidator,
    );
    const extractedViz = extractor.getDashboardVisualisationResource();
    const existingId = await this.findExistingVisualisationId(visualisation);

    const id = existingId
      ? await this.updateVisualisation(existingId, extractedViz)
      : await this.createVisualisation(extractedViz);

    await this.upsertDashboardsAndRelations(id, dashboards, dashboardRelations);

    return { id, code: extractedViz.dashboardItem.code };
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
    dashboards: UpsertDashboard[],
    dashboardRelations: UpsertDashboardRelation[],
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
