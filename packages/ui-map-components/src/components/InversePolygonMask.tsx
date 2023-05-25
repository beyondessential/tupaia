/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Polygon as PolygonComponent, PolygonProps } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import styled from 'styled-components';

const BasicPolygon = styled(PolygonComponent)`
  fill: black;
  fill-opacity: 0.8;
  stroke-width: 0;
`;

type Region = LatLngExpression[];

const getOuterPolygon = (region: Region): PolygonProps['positions'] => {
  return [
    [
      [90, -180],
      [90, 180],
      [-90, 180],
      [-90, -180],
    ],
    region,
  ];
};

export const InversePolygonMask = ({ region }: { region: Region | null }) => {
  if (!Array.isArray(region)) {
    return null;
  }

  const positions = getOuterPolygon(region);

  return <BasicPolygon positions={positions} interactive={false} />;
};
