/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { DEFAULT_TILESETS, getAutoTileSet } from '@tupaia/ui-map-components';
import { CUSTOM_TILE_SETS } from '../../../constants';
import { useProject } from '../../../api/queries';
import { useGAEffect } from '../../../utils';

export const useTilesets = () => {
  const { projectCode } = useParams();
  const { data: project } = useProject(projectCode);
  const initialTileSet = getAutoTileSet();
  const [activeTileSet, setActiveTileSet] = useState(initialTileSet);
  const { tileSets = '' } = project?.config || {};
  const customTilesetNames = tileSets.split(',');
  const customTileSets = customTilesetNames
    .map(
      tileset =>
        CUSTOM_TILE_SETS.find(({ key }) => key === tileset) as (typeof CUSTOM_TILE_SETS)[0],
    )
    .filter(item => item);
  const defaultTileSets = [DEFAULT_TILESETS.osm, DEFAULT_TILESETS.satellite];
  const availableTileSets = [...defaultTileSets, ...customTileSets];

  useGAEffect('Map', 'Change Tile Set', activeTileSet?.label);

  const onTileSetChange = (tileSetKey: string) => {
    const newActiveTileSet = availableTileSets.find(
      ({ key }) => key === tileSetKey,
    ) as (typeof CUSTOM_TILE_SETS)[0];
    setActiveTileSet(newActiveTileSet);
  };

  useEffect(() => {
    if (
      activeTileSet &&
      availableTileSets.length > 0 &&
      !availableTileSets.some(({ key }) => key === activeTileSet.key)
    ) {
      setActiveTileSet(initialTileSet);
    }
  }, [JSON.stringify(availableTileSets)]);

  return {
    availableTileSets,
    activeTileSet,
    onTileSetChange,
  };
};
