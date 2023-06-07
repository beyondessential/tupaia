/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { MapOverlaySelector } from './MapOverlaySelector';
import { MapWatermark } from './MapWatermark';
import { CONTROL_BAR_PADDING } from '../theme';

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
`;

const Watermark = styled(MapWatermark)`
  margin-left: 2px;
  margin-bottom: 16px;
`;

/**
 * This is the layout for the lefthand side of the app, which contains the map controls and watermark
 */

export const Main = () => {
  return (
    <>
      <FlexDiv>
        <LeftCol>
          <TopRow>
            <MapOverlaySelector />
          </TopRow>
          <BottomRow>{/** This is where the map legend would go */}</BottomRow>
        </LeftCol>
        {/** This is where the tilepicker would go */}
        <Watermark />
      </FlexDiv>
    </>
  );
};
