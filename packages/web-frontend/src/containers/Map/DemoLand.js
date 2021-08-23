/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { LayerGroup, GeoJSON } from '@tupaia/ui-components/lib/map';

import { DEMOLAND_COLORS } from '../../styles';
import { demoLandLand, demoLandRoads, demoLandRivers } from './GeoJSONS';

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
    <GeoJSON data={demoLandLand} key="land" style={styles.land} />
    <GeoJSON data={demoLandRivers} key="rivers" style={styles.rivers} />
    <GeoJSON data={demoLandRoads} key="roads" style={styles.roads} />
  </LayerGroup>
);
