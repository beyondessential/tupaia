import React, { useState } from 'react';
import styled from 'styled-components';
import {
  LeafletMap,
  TileLayer,
  Legend,
  ZoomControl,
  TilePicker as TilePickerComponent,
} from '@tupaia/ui-map-components';
import { YearSelector, MapOverlaysPanel, MarkerLayer, EntityPolygon } from '../components';
import { useMapOverlayReportData, useMapOverlaysData } from '../api';
import { TILE_SETS, DEFAULT_DATA_YEAR } from '../constants';
import { useUrlParams, useUrlSearchParam } from '../utils';

const Container = styled.div`
  position: relative;
  z-index: 1; // make sure the map is under the site menus & search
  display: flex;
  height: calc(100vh - 219px);
  min-height: 350px; // below which the map is basically unusable
`;

const Main = styled.div`
  position: relative;
  flex: 1;
  height: 100%;
`;

const Map = styled(LeafletMap)`
  flex: 1;
  height: 100%;
  z-index: 1;

  // leaflet ZoomControl component doesn't pass down any props to the html
  // so it's not possible to make a styled component of it
  .leaflet-control-zoom {
    z-index: 1;
    border: none;
    top: -52px;
    right: 5px;

    a {
      color: ${props => props.theme.palette.text.secondary};

      &:first-child {
        border-color: ${props => props.theme.palette.grey['400']};
      }
    }
  }
`;

const MapInner = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  z-index: 999;
  pointer-events: none;
`;

const LegendContainer = styled.div`
  display: flex;
  flex: 1;
  margin: 0 0.6rem 0.375rem;
`;

const TilePicker = styled(TilePickerComponent)`
  pointer-events: none;
`;

const getDefaultTileSet = () => {
  // default to osm in dev so that we don't pay for tiles when running locally
  if (!import.meta.env.PROD) {
    return 'osm';
  }
  const SLOW_LOAD_TIME_THRESHOLD = 2 * 1000; // 2 seconds in milliseconds
  return window.loadTime < SLOW_LOAD_TIME_THRESHOLD ? 'satellite' : 'osm';
};

export const MapView = () => {
  const { entityCode } = useUrlParams();
  const [selectedYear, setSelectedYear] = useUrlSearchParam('year', DEFAULT_DATA_YEAR);
  const [activeTileSetKey, setActiveTileSetKey] = useState(getDefaultTileSet());

  const { data: overlaysData, isLoading: isLoadingOverlays } = useMapOverlaysData({ entityCode });

  const {
    isLoading,
    data: overlayReportData,
    entityData,
    hiddenValues,
    setValueHidden,
    selectedOverlay,
    setSelectedOverlay,
  } = useMapOverlayReportData({ entityCode, year: selectedYear });

  const activeTileSet = TILE_SETS.find(tileSet => tileSet.key === activeTileSetKey);

  return (
    <Container>
      <MapOverlaysPanel
        isLoadingOverlays={isLoadingOverlays}
        isLoadingData={isLoading}
        overlays={overlaysData}
        selectedOverlay={selectedOverlay}
        setSelectedOverlay={setSelectedOverlay}
        YearSelector={<YearSelector value={selectedYear} onChange={setSelectedYear} />}
      />
      <Main>
        <Map bounds={entityData ? entityData.bounds : null} shouldSnapToPosition dragging>
          <TileLayer tileSetUrl={activeTileSet.url} />
          <ZoomControl position="bottomright" />
          <MarkerLayer
            measureData={overlayReportData ? overlayReportData.measureData : null}
            serieses={overlayReportData ? overlayReportData.serieses : null}
          />
          <EntityPolygon entity={entityData} />
        </Map>
        <MapInner>
          <LegendContainer>
            {overlayReportData && overlayReportData.serieses && (
              <Legend
                measureInfo={{ [selectedOverlay]: overlayReportData }}
                setValueHidden={setValueHidden}
                hiddenValues={hiddenValues}
                currentMapOverlayCodes={[selectedOverlay]}
                displayedMapOverlayCodes={[selectedOverlay]}
              />
            )}
          </LegendContainer>
          <TilePicker
            tileSets={TILE_SETS}
            activeTileSet={activeTileSet}
            onChange={setActiveTileSetKey}
          />
        </MapInner>
      </Main>
    </Container>
  );
};
