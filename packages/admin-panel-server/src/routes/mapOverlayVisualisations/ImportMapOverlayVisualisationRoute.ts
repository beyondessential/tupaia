/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import assert from 'assert';
import { Request, Response, NextFunction } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { ValidationError, reduceToDictionary, snakeKeys, UploadError, yup } from '@tupaia/utils';

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
import { readAndValidateFiles } from '../../utils';

const importFileSchema = yup.object().shape(
  {
    mapOverlayGroups: yup.array().of(mapOverlayGroupValidator.required()),
    mapOverlayGroupRelations: yup.array().of(mapOverlayGroupRelationsValidator.required()),
    legacy: yup.bool(),
    // ...the rest of the fields belong to the visualisation object and are validated separately
  },
  [['mapOverlayGroups', 'mapOverlayGroupRelations']],
);

export type ImportMapOverlayVisualisationRequest = Request<
  Record<string, never>,
  { importedVizes: { id: string; code: string }[]; message: string },
  Record<string, never>,
  Record<string, never>
>;

type ImportFileContent = {
  mapOverlayGroups?: MapOverlayGroup[];
  mapOverlayGroupRelations?: MapOverlayGroupRelation[];
  legacy?: boolean;
} & Record<string, unknown>;

export class ImportMapOverlayVisualisationRoute extends Route<ImportMapOverlayVisualisationRequest> {
  private readonly meditrakConnection: MeditrakConnection;

  public constructor(req: ImportMapOverlayVisualisationRequest, res: Response, next: NextFunction) {
    super(req, res, next);

    this.meditrakConnection = new MeditrakConnection(req.session);
  }

  public async buildResponse() {
    const { files } = this.req;
    if (!files) {
      throw new UploadError();
    }

    const validatedFiles = Object.entries(readAndValidateFiles(files, importFileSchema));

    const importedVizes: { id: string; code: string }[] = [];
    const errors: [string, string][] = [];
    for (let i = 0; i < validatedFiles.length; i++) {
      const [fileName, file] = validatedFiles[i];
      try {
        importedVizes.push(await this.importViz(file));
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
      message: `${importedVizes.length} mapOverlay visualisation${
        importedVizes.length !== 1 ? 's' : ''
      } imported successfully`,
    };
  }

  private async importViz(fileContent: ImportFileContent) {
    const { mapOverlayGroups = [], mapOverlayGroupRelations = [], ...visualisation } = fileContent;

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

    return { id, code: extractedViz.mapOverlay.code };
  }

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
