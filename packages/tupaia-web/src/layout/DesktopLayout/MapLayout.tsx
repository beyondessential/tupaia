/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Map } from '../Map';
import { TILE_SETS } from '../../constants';
import { TilePicker } from '@tupaia/ui-map-components';

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  position: relative;
`;

// Placeholder for MapOverlaySelector component
const MapOverlaySelector = styled.div`
  width: 300px;
  margin: 1em;
  height: 40px;
  border-radius: 5px;
  background: #ff7428;
  opacity: 0.6;
  position: absolute;
`;

// Position this absolutely so it can be placed over the map
const TilePickerWrapper = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  height: 100%;
`;

/**
 * This is the layout for the lefthand side of the app, which contains the map controls and watermark, as well as the map
 */

export const MapLayout = () => {
  const [activeTileSet, setActiveTileSet] = useState(TILE_SETS[0]);

  const onTileSetChange = (tileSetKey: string) => {
    setActiveTileSet(TILE_SETS.find(({ key }) => key === tileSetKey) as typeof TILE_SETS[0]);
  };
  return (
    <Wrapper>
      {/** order here matters - Map needs to be first so any controls can go over the top of it */}
      <Map activeTileSet={activeTileSet} />
      <MapOverlaySelector />
      <TilePickerWrapper>
        <TilePicker tileSets={TILE_SETS} activeTileSet={activeTileSet} onChange={onTileSetChange} />
      </TilePickerWrapper>
    </Wrapper>
  );
};
