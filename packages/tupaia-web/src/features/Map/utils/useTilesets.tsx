import type { TileSet } from '@tupaia/ui-map-components';
import { DEFAULT_TILESETS, getAutoTileSet } from '@tupaia/ui-map-components';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useProject } from '../../../api/queries';
import { CUSTOM_TILE_SETS } from '../../../constants';
import { useGAEffect } from '../../../utils';

const defaultTileSets = [DEFAULT_TILESETS.osm, DEFAULT_TILESETS.satellite];

export const useTilesets = () => {
  const { projectCode } = useParams();
  const { data: project } = useProject(projectCode);
  const initialTileSet = getAutoTileSet();
  const [activeTileSet, setActiveTileSet] = useState<TileSet>(initialTileSet);

  const availableTileSets = useMemo(() => {
    const { tileSets = '' } = project?.config || {};
    const customTilesetNames = tileSets.split(',');
    const customTileSets = customTilesetNames
      .map(tileset => CUSTOM_TILE_SETS.find(({ key }) => key === tileset) as TileSet)
      .filter(item => item);
    return [...defaultTileSets, ...customTileSets];
  }, [project?.config]);

  useGAEffect('Map', 'Change Tile Set', activeTileSet?.label);

  const onTileSetChange = (tileSetKey: string) => {
    const newActiveTileSet = availableTileSets.find(({ key }) => key === tileSetKey);
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
  }, [availableTileSets]);

  return {
    availableTileSets,
    activeTileSet,
    onTileSetChange,
  };
};
