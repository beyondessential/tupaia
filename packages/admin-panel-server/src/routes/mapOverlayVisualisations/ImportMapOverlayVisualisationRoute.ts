/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import assert from 'assert';
import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { ValidationError, reduceToDictionary, snakeKeys, UploadError, yup } from '@tupaia/utils';

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
import { readFileContent } from '../../utils';

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
  public async buildResponse() {
    const { files } = this.req;
    if (!files || !Array.isArray(files)) {
      throw new UploadError();
    }

    const importedVizes: { id: string; code: string }[] = [];
    const successes: string[] = [];
    const errors: { fileName: string; message: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const { originalname: fileName } = file;
      try {
        const fileContent = importFileSchema.validateSync(readFileContent(file));
        importedVizes.push(await this.importViz(fileContent));
        successes.push(fileName);
      } catch (error: any) {
        errors.push({ fileName, message: error.message });
      }
    }

    if (errors.length > 0) {
      throw new UploadError(errors, successes);
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

    const [viz] = await this.req.ctx.services.central.fetchResources('mapOverlayVisualisations', {
      filter: {
        id: id ?? undefined,
        code,
      },
    });
    return viz?.mapOverlay?.id;
  };

  private createVisualisation = async (visualisation: MapOverlayVizResource) => {
    const { central: centralApi } = this.req.ctx.services;
    await centralApi.createResource('mapOverlayVisualisations', {}, visualisation);
    const [viz]: MapOverlayVizResource[] = await centralApi.fetchResources(
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
    await this.req.ctx.services.central.updateResource(
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
    const { central: centralApi } = this.req.ctx.services;
    await this.upsertMapOverlayGroups(mapOverlayGroups.map(mog => snakeKeys(mog)));
    const mapOverlayGroupRecords = await centralApi.fetchResources('mapOverlayGroups', {
      filter: {
        code: mapOverlayGroupRelations.map(mogr => mogr.mapOverlayGroupCode),
      },
    });
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
        this.req.ctx.services.central.upsertResource(
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
        this.req.ctx.services.central.upsertResource(
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
