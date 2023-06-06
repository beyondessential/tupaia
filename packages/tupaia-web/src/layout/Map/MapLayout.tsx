/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { MapOverlaySelector } from './MapOverlaySelector';
import { MapWatermark } from './MapWatermark';
import { CONTROL_BAR_PADDING } from '../../theme';

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

const ContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
`;

const MapContainer = styled.div<{
  $rightOffset: number;
}>`
  height: 100vh;
  width: calc(100vw - ${p => p.$rightOffset}px);
  transition: width 0.5s ease;
  position: absolute;
  z-index: -1; // make this appear underneath the map overlay selector and the top bar
`;

interface MapLayoutProps {
  sidePanelWidth?: number; // This will come from redux, based on whether the side panel is expanded or not
}
export const MapLayout = ({ sidePanelWidth = 300 }: MapLayoutProps) => {
  return (
    <>
      <ContentContainer>
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
      </ContentContainer>
      {/** This is where SessionExpiredDialog and any other overlays would go, as well as loading screen */}
      <MapContainer $rightOffset={sidePanelWidth}>
        {/* This is where the Map component will go */}
      </MapContainer>
    </>
  );
};
