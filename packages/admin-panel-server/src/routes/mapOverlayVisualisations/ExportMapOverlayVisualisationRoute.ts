/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';
import { keyBy } from 'lodash';

import { camelKeys } from '@tupaia/utils';
import { Route } from '@tupaia/server-boilerplate';
import { CentralConnection } from '../../connections';
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

  private readonly centralConnection: CentralConnection;

  public constructor(req: ExportMapOverlayVisualisationRequest, res: Response, next: NextFunction) {
    super(req, res, next);

    this.centralConnection = new CentralConnection(req.session);
  }

  public async buildResponse() {
    this.validate();

    const { visualisation: builtVisualisation } = this.req.body;

    const mapOverlay = await this.findExistingMapOverlay();
    const visualisation =
      builtVisualisation || (await this.buildMapOverlayVisualisation(mapOverlay));
    const fileBaseName = visualisation.code || 'new_map_overlay_visualisation';

    const { id, ...visualisationWithoutId } = visualisation;
    const { mapOverlayGroups, mapOverlayGroupRelations } = await this.buildMapOverlaysAndRelations(
      mapOverlay,
    );

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

    if (mapOverlayVisualisationId) {
      const mapOverlay = await this.centralConnection.fetchResources(
        `mapOverlays/${mapOverlayVisualisationId}`,
      );
      if (!mapOverlay) {
        // We assert that the record exists, since a specific id was provided
        throw new Error(`Could not find visualisation with id ${mapOverlayVisualisationId}`);
      }
      return mapOverlay;
    }

    const { code } = this.req.body.visualisation;
    const [mapOverlay] = await this.centralConnection.fetchResources('mapOverlays', {
      filter: {
        code,
      },
    });
    return mapOverlay;
  };

  private buildMapOverlayVisualisation = async (mapOverlay: MapOverlayRecord) => {
    const vizResource: MapOverlayVizResource = await this.centralConnection.fetchResources(
      `mapOverlayVisualisations/${mapOverlay.id}`,
    );
    return combineMapOverlayVisualisation(vizResource);
  };

  private buildMapOverlaysAndRelations = async (mapOverlay: MapOverlayRecord) => {
    if (!mapOverlay) {
      return { mapOverlays: [], mapOverlayGroupRelations: [] };
    }

    const relationRecords: MapOverlayGroupRelationRecord[] = await this.centralConnection.fetchResources(
      `mapOverlays/${mapOverlay.id}/mapOverlayGroupRelations`,
    );
    const mapOverlayGroupIds = relationRecords.map(mogr => mogr.map_overlay_group_id);
    const mapOverlayGroupRecords: MapOverlayGroupRecord[] = await this.centralConnection.fetchResources(
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
