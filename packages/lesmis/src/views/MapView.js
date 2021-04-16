/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import L from 'leaflet';
import {
  MapContainer,
  TileLayer,
  MarkerLayer,
  PolygonLayer,
  Polygon,
  Legend as LegendComponent,
  TilePicker as TilePickerComponent,
} from '@tupaia/ui-components/lib/map';
import { MapOverlaysPanel, EntityPolygonLink, MapOverlaysPanelContainer } from '../components';
import {
  useEntitiesData,
  useEntityData,
  useMapOverlayReportData,
  useMapOverlaysData,
} from '../api';
import { TILE_SETS } from '../constants';
import { useUrlParams } from '../utils';

const Container = styled.div`
  position: relative;
  z-index: 1; // make sure the map is under the site menus & search
  display: flex;
  height: calc(100vh - 265px);
  min-height: 600px;
`;

const Map = styled(MapContainer)`
  flex: 1;
  height: 100%;
`;

const Main = styled.div`
  position: relative;
  flex: 1;
  height: 100%;
`;

const EmptyPanel = styled(MapOverlaysPanelContainer)`
  padding: 2rem;
`;

const Legend = styled(LegendComponent)`
  position: absolute;
  bottom: 5px;
  z-index: 999;
  left: 50%;
  transform: translateX(-50%);
`;

const TilePicker = styled(TilePickerComponent)`
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 9999;
  pointer-events: none;
`;

const useProvinceData = () => {
  const query = useEntitiesData();
  let provinces = [];

  if (query.data) {
    provinces = query.data.filter(entity => entity.parentCode === 'LA');
  }

  return { ...query, data: provinces };
};

export const MapView = () => {
  const { entityCode } = useUrlParams();
  const [activeTileSetKey, setActiveTileSetKey] = useState(TILE_SETS[0].key);
  const [hiddenValues, setHiddenValues] = useState([]);
  const [selectedOverlay, setSelectedOverlay] = useState(null);

  useEffect(() => {
    setHiddenValues([]);
  }, [setHiddenValues, selectedOverlay]);

  const { data: entityData } = useEntityData({
    entityCode,
  });

  const { data: overlayReportData } = useMapOverlayReportData({
    entityCode,
    mapOverlayCode: selectedOverlay,
    hiddenValues,
  });

  const { data: overlaysData, isLoading } = useMapOverlaysData({ entityCode });

  const { data: provicesData } = useProvinceData();

  const handleLocationChange = (map, bounds) => {
    const mapBoxBounds = L.latLngBounds(bounds);
    const maxBounds = mapBoxBounds.pad(2);
    map.setMaxBounds(maxBounds);
  };

  const handlesetHiddenValues = value => {
    const exists = hiddenValues.includes(value);
    const newHiddenValues = exists
      ? hiddenValues.filter(m => m !== value)
      : [...hiddenValues, value];
    setHiddenValues(newHiddenValues);
  };

  const activeTileSet = TILE_SETS.find(tileSet => tileSet.key === activeTileSetKey);
  const isCountry = entityData?.type === 'country';

  return (
    <Container>
      {isCountry ? (
        <EmptyPanel>Select a province from the map to view data.</EmptyPanel>
      ) : (
        <MapOverlaysPanel
          isLoading={isLoading}
          overlays={overlaysData}
          selectedOverlay={selectedOverlay}
          setSelectedOverlay={setSelectedOverlay}
        />
      )}
      <Main>
        <Map
          bounds={entityData ? entityData.bounds : null}
          onLocationChange={handleLocationChange}
          dragging
        >
          <TileLayer tileSetUrl={activeTileSet.url} />
          {isCountry ? (
            <PolygonLayer entities={provicesData} Polygon={EntityPolygonLink} />
          ) : (
            <>
              <MarkerLayer
                measureData={overlayReportData ? overlayReportData.measureData : null}
                measureOptions={overlayReportData ? overlayReportData.measureOptions : null}
              />
              <Polygon entity={entityData} />
            </>
          )}
        </Map>
        <TilePicker
          tileSets={TILE_SETS}
          activeTileSet={activeTileSet}
          onChange={setActiveTileSetKey}
        />
        {!isCountry && (
          <Legend
            measureOptions={overlayReportData?.measureOptions}
            setHiddenValues={handlesetHiddenValues}
            hiddenValues={hiddenValues}
          />
        )}
      </Main>
    </Container>
  );
};
