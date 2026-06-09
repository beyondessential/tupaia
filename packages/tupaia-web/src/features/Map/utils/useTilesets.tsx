import { DEFAULT_TILESETS, getAutoTileSet, type TileSet } from '@tupaia/ui-map-components';
import { useEffect, useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useProject } from '../../../api/queries';
import { CUSTOM_TILE_SETS } from '../../../constants';
import { useGAEffect } from '../../../utils';

const isDefined = <T,>(value: T): value is Exclude<T, undefined> => value !== undefined;

const defaultTileSets = [
  DEFAULT_TILESETS.osm,
  DEFAULT_TILESETS.satellite,
] as const satisfies TileSet[];

export const useTilesets = (): {
  activeTileSet: TileSet;
  availableTileSets: TileSet[];
  onTileSetChange: (tileSetKey: string) => void;
} => {
  const { projectCode } = useParams();
  const { data: project } = useProject(projectCode);
  const [initialTileSet] = useState(getAutoTileSet());
  const [activeTileSet, setActiveTileSet] = useState<TileSet>(initialTileSet);

  const availableTileSets: TileSet[] = useMemo(() => {
    const customTilesetNames = (project?.config?.tileSets as string | undefined)?.split(',') ?? [];
    const customTileSets = customTilesetNames
      .map(tileSetName => CUSTOM_TILE_SETS.find(({ key }) => key === tileSetName))
      .filter(isDefined);
    return [...defaultTileSets, ...customTileSets];
  }, [project?.config?.tileSets]);

  useGAEffect('Map', 'Change Tile Set', activeTileSet?.label);

  const onTileSetChange = useCallback(
    (tileSetKey: string) => {
      const newActiveTileSet = availableTileSets.find(({ key }) => key === tileSetKey);
      setActiveTileSet(newActiveTileSet ?? initialTileSet);
    },
    [availableTileSets, initialTileSet],
  );

  useEffect(() => {
    if (
      activeTileSet &&
      availableTileSets.length > 0 &&
      !availableTileSets.some(({ key }) => key === activeTileSet.key)
    ) {
      setActiveTileSet(initialTileSet);
    }
  }, [activeTileSet, availableTileSets, initialTileSet]);

  return {
    availableTileSets,
    activeTileSet,
    onTileSetChange,
  };
};
