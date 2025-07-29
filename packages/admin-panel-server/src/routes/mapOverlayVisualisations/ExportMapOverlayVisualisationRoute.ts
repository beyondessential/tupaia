import { Request } from 'express';
import { keyBy } from 'es-toolkit/compat';

import { camelKeys } from '@tupaia/utils';
import { Route } from '@tupaia/server-boilerplate';
import { combineMapOverlayVisualisation } from '../../viz-builder';
import type {
  MapOverlayRecord,
  MapOverlayGroupRelation,
  MapOverlayGroupRelationRecord,
  MapOverlayVizResource,
  MapOverlayViz,
  MapOverlayGroup,
  MapOverlayGroupRecord,
} from '../../viz-builder';

export type ExportMapOverlayVisualisationRequest = Request<
  { mapOverlayVisualisationId?: string },
  { contents: MapOverlayViz; filePath: string; type: string },
  { visualisation: MapOverlayViz },
  Record<string, any>
>;

export class ExportMapOverlayVisualisationRoute extends Route<ExportMapOverlayVisualisationRequest> {
  protected readonly type = 'download';

  public async buildResponse() {
    this.validate();

    const { visualisation: builtVisualisation } = this.req.body;

    const mapOverlay = await this.findExistingMapOverlay();
    const visualisation =
      builtVisualisation || (await this.buildMapOverlayVisualisation(mapOverlay));
    const fileBaseName = visualisation.code || 'new_map_overlay_visualisation';

    const { id, ...visualisationWithoutId } = visualisation;
    const { mapOverlayGroups, mapOverlayGroupRelations } =
      await this.buildMapOverlaysAndRelations(mapOverlay);

    return {
      contents: {
        ...visualisationWithoutId,
        mapOverlayGroups,
        mapOverlayGroupRelations,
      },
      filePath: `${fileBaseName}.json`,
      type: '.json',
    };
  }

  private validate = () => {
    const { mapOverlayVisualisationId } = this.req.params;
    const { visualisation } = this.req.body;

    if (!mapOverlayVisualisationId && !visualisation) {
      throw new Error('You must provide either a visualisation id or a visualisation object');
    }
    if (mapOverlayVisualisationId && visualisation) {
      throw new Error(
        'Both visualisation id and visualisation object provided, must provide one or the other',
      );
    }
    if (visualisation && !visualisation.code) {
      throw new Error('Visualisation object must have a code');
    }
  };

  private findExistingMapOverlay = async (): Promise<MapOverlayRecord> => {
    const { mapOverlayVisualisationId } = this.req.params;
    const { central: centralApi } = this.req.ctx.services;

    if (mapOverlayVisualisationId) {
      const mapOverlay = await centralApi.fetchResources(
        `mapOverlays/${mapOverlayVisualisationId}`,
      );
      if (!mapOverlay) {
        // We assert that the record exists, since a specific id was provided
        throw new Error(`Could not find visualisation with id ${mapOverlayVisualisationId}`);
      }
      return mapOverlay;
    }

    const { code } = this.req.body.visualisation;
    const [mapOverlay] = await centralApi.fetchResources('mapOverlays', {
      filter: {
        code,
      },
    });
    return mapOverlay;
  };

  private buildMapOverlayVisualisation = async (mapOverlay: MapOverlayRecord) => {
    const vizResource: MapOverlayVizResource = await this.req.ctx.services.central.fetchResources(
      `mapOverlayVisualisations/${mapOverlay.id}`,
    );
    return combineMapOverlayVisualisation(vizResource);
  };

  private buildMapOverlaysAndRelations = async (mapOverlay: MapOverlayRecord) => {
    if (!mapOverlay) {
      return { mapOverlays: [], mapOverlayGroupRelations: [] };
    }
    const { central: centralApi } = this.req.ctx.services;

    const relationRecords: MapOverlayGroupRelationRecord[] = await centralApi.fetchResources(
      `mapOverlays/${mapOverlay.id}/mapOverlayGroupRelations`,
    );
    const mapOverlayGroupIds = relationRecords.map(mogr => mogr.map_overlay_group_id);
    const mapOverlayGroupRecords: MapOverlayGroupRecord[] = await centralApi.fetchResources(
      'mapOverlayGroups',
      {
        filter: {
          id: mapOverlayGroupIds,
        },
      },
    );
    const mapOverlayGroupsById = keyBy(mapOverlayGroupRecords, 'id');

    const mapOverlayGroups = mapOverlayGroupRecords.map(({ id, ...mapOverlayGroup }) =>
      camelKeys(mapOverlayGroup),
    );
    const mapOverlayGroupRelations = relationRecords.map(
      ({ id, map_overlay_group_id: mapOverlayGroupId, child_id, ...mapOverlayGroupRelation }) =>
        camelKeys({
          mapOverlayGroupCode: mapOverlayGroupsById[mapOverlayGroupId]?.code,
          ...mapOverlayGroupRelation,
          childCode: mapOverlay.code,
        }),
    );

    return {
      mapOverlayGroups: mapOverlayGroups as Omit<MapOverlayGroup, 'id'>[],
      mapOverlayGroupRelations: mapOverlayGroupRelations as MapOverlayGroupRelation[],
    };
  };
}
