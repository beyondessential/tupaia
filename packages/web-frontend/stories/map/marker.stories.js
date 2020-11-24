/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { ICON_VALUES } from '../../src/components/Marker/markerIcons';
import { getMarkerForOption } from '../../src/components/Marker';
import { BREWER_PALETTE } from '../../src/styles';

const DisplayCell = styled.span`
  width: 10px;
  height: 10px;
  display: inline-block;
  margin-right: 20px;
`;

const DisplayRow = styled.span`
  display: block;
  padding-left: 1rem;
  padding-bottom: 1rem;
`;

const DisplayRowTitle = styled.h3`
  color: white;
`;

export default {
  title: 'Map/Marker',
};

export const IconMarker = () => (
  <>
    {ICON_VALUES.map(iconKey => (
      <DisplayRow key={iconKey}>
        <DisplayRowTitle>{iconKey}</DisplayRowTitle>
        <>
          {Object.keys(BREWER_PALETTE).map(color => (
            <DisplayCell key={color} title={color}>
              {getMarkerForOption(iconKey, color)}
            </DisplayCell>
          ))}
        </>
      </DisplayRow>
    ))}
  </>
);
