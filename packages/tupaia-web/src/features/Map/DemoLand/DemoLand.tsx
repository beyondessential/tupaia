import React from 'react';
import { LayerGroup, GeoJSON, GeoJSONProps } from '@tupaia/ui-map-components';
import land from './demoLandLand.json';
import rivers from './demoLandRivers.json';
import roads from './demoLandRoads.json';

type Data = GeoJSONProps['data'];

const DEMOLAND_COLORS = {
  LAND: 'rgb(229,215,164)',
  OUTLINE: 'rgb(0,0,0)',
  ROADS: 'rgb(230,130,39)',
  RIVERS: 'rgb(59,135,203)',
};

const styles = {
  land: {
    fillColor: DEMOLAND_COLORS.LAND,
    color: DEMOLAND_COLORS.OUTLINE,
    weight: 2,
    fillOpacity: 1,
  },
  roads: {
    color: DEMOLAND_COLORS.ROADS,
    weight: 1,
  },
  rivers: {
    color: DEMOLAND_COLORS.RIVERS,
    weight: 1,
  },
};

export const DemoLand = () => (
  <LayerGroup>
    <GeoJSON data={land as Data} key="land" style={styles.land} />
    <GeoJSON data={rivers as Data} key="rivers" style={styles.rivers} />
    <GeoJSON data={roads as Data} key="roads" style={styles.roads} />
  </LayerGroup>
);
