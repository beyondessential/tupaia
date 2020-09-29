/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * MapDiv
 *
 * Visual flex arranged div used for laying out the map controls on the screen such as SearchBar,
 * LocationBar, UserBar the map controls. Probably a custom attribution as well.
 */
import React from 'react';
import styled from 'styled-components';
import { MapControl } from '../containers/MapControl';
import MeasureLegend from '../containers/MeasureLegend';
import MeasureBar from '../containers/MeasureBar';
import { CONTROL_BAR_PADDING } from '../styles';

const FlexDiv = styled.div`
  flex: 1;
  display: flex;
`;

const LeftCol = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const TopRow = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: ${CONTROL_BAR_PADDING}px;
`;

const BottomRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  padding: 10px 10px 0 10px;
`;

export const MapDiv = () => {
  return (
    <FlexDiv>
      <LeftCol>
        <TopRow>
          <MeasureBar />
        </TopRow>
        <BottomRow>
          <MeasureLegend />
        </BottomRow>
      </LeftCol>
      <MapControl />
    </FlexDiv>
  );
};
