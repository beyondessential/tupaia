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

import { MeditrakConnection } from '../../connections';
import {
  MapOverlayVisualisationExtractor,
  draftReportValidator,
  mapOverlayGroupValidator,
  draftMapOverlayValidator,
  mapOverlayGroupRelationsValidator,
} from '../../viz-builder';
import type {
  MapOverlayVizResource,
  MapOverlayGroupRecord,
  MapOverlayGroup,
  MapOverlayGroupRelation,
  MapOverlayGroupRelationRecord,
} from '../../viz-builder';
import { ValidationError } from '@tupaia/utils';

const importFileSchema = yup.object().shape(
  {
    mapOverlayGroups: yup.array().of(mapOverlayGroupValidator.required()),
    mapOverlayGroupRelations: yup.array().of(mapOverlayGroupRelationsValidator.required()),
    // ...the rest of the fields belong to the visualisation object and are validated separately
  },
  [['mapOverlayGroups', 'mapOverlayGroupRelations']],
);

export type ImportMapOverlayVisualisationRequest = Request<
  Record<string, never>,
  { id: string; message: string },
  Record<string, never>,
  Record<string, never>
>;

export class ImportMapOverlayVisualisationRoute extends Route<ImportMapOverlayVisualisationRequest> {
  private readonly meditrakConnection: MeditrakConnection;

  public constructor(req: ImportMapOverlayVisualisationRequest, res: Response, next: NextFunction) {
    super(req, res, next);

    this.meditrakConnection = new MeditrakConnection(req.session);
  }

  public async buildResponse() {
    if (!this.req.file) {
      throw new UploadError();
    }

    const {
      mapOverlayGroups = [],
      mapOverlayGroupRelations = [],
      ...visualisation
    } = this.readFileContents();

    if (visualisation.legacy) {
      throw new ValidationError('Legacy viz not supported');
    }

    const extractor = new MapOverlayVisualisationExtractor(
      visualisation,
      draftMapOverlayValidator,
      draftReportValidator,
    );
    const extractedViz = extractor.getMapOverlayVisualisationResource();
    const existingId = await this.findExistingVisualisationId(visualisation);

    const id = existingId
      ? await this.updateVisualisation(existingId, extractedViz)
      : await this.createVisualisation(extractedViz);

    await this.upsertMapOverlayGroupsAndRelations(id, mapOverlayGroups, mapOverlayGroupRelations);

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

    const [viz] = await this.meditrakConnection.fetchResources('mapOverlayVisualisations', {
      filter: {
        id: id ?? undefined,
        code,
      },
    });
    return viz?.mapOverlay?.id;
  };

  private createVisualisation = async (visualisation: MapOverlayVizResource) => {
    await this.meditrakConnection.createResource('mapOverlayVisualisations', {}, visualisation);
    const [viz]: MapOverlayVizResource[] = await this.meditrakConnection.fetchResources(
      'mapOverlayVisualisations',
      {
        filter: {
          code: visualisation.mapOverlay.code,
        },
      },
    );

    if (!viz) {
      throw new Error('Could not create visualisation');
    }
    return viz.mapOverlay.id;
  };

  private updateVisualisation = async (vizId: string, visualisation: Record<string, unknown>) => {
    await this.meditrakConnection.updateResource(
      `mapOverlayVisualisations/${vizId}`,
      {},
      visualisation,
    );
    return vizId;
  };

  private upsertMapOverlayGroupsAndRelations = async (
    vizId: string,
    mapOverlayGroups: MapOverlayGroup[],
    mapOverlayGroupRelations: MapOverlayGroupRelation[],
  ) => {
    await this.upsertMapOverlayGroups(mapOverlayGroups.map(mog => snakeKeys(mog)));
    const mapOverlayGroupRecords = await this.meditrakConnection.fetchResources(
      'mapOverlayGroups',
      {
        filter: {
          code: mapOverlayGroupRelations.map(mogr => mogr.mapOverlayGroupCode),
        },
      },
    );
    const mapOverlayGroupCodeToId = reduceToDictionary(mapOverlayGroupRecords, 'code', 'id');

    const relationsToUpsert = mapOverlayGroupRelations.map(
      ({ mapOverlayGroupCode, ...mapOverlayGroupRelation }) => {
        const mapOverlayGroupId = mapOverlayGroupCodeToId[mapOverlayGroupCode];
        assert.ok(
          mapOverlayGroupId,
          `Could not find id for map overlay group with code ${mapOverlayGroupCode}`,
        );
        return snakeKeys({
          ...mapOverlayGroupRelation,
          map_overlay_group_id: mapOverlayGroupId,
          child_id: vizId,
        });
      },
    );
    await this.upsertMapOverlayGroupRelations(relationsToUpsert);
  };

  private upsertMapOverlayGroups = async (mapOverlayGroups: MapOverlayGroupRecord[]) =>
    Promise.all(
      mapOverlayGroups.map(mapOverlayGroup =>
        this.meditrakConnection.upsertResource(
          'mapOverlayGroups',
          {
            filter: {
              code: mapOverlayGroup.code,
            },
          },
          mapOverlayGroup,
        ),
      ),
    );

  private upsertMapOverlayGroupRelations = async (
    mapOverlayGroupRelations: MapOverlayGroupRelationRecord[],
  ) =>
    Promise.all(
      mapOverlayGroupRelations.map(relation =>
        this.meditrakConnection.upsertResource(
          'mapOverlayGroupRelations',
          {
            filter: {
              map_overlay_group_id: relation.map_overlay_group_id,
              child_id: relation.child_id,
            },
          },
          relation,
        ),
      ),
    );
}
