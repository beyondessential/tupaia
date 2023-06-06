/**
 * Tupaia Web
 * Copyright (c) 2021 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState, useCallback, useMemo, ReactNode } from 'react';
import styled from 'styled-components';
import { FlexSpaceBetween, FlexStart } from '@tupaia/ui-components';
import MuiLayersIcon from '@material-ui/icons/Layers';
import DownArrow from '@material-ui/icons/ArrowDropDown';
import { Fade, Typography, Divider } from '@material-ui/core';
import { Content, EmptyContentText, ExpandedContent } from './Content';
import { LastUpdated } from './LastUpdated';
import { DropDownMenu } from '../../components';

const MAX_MAP_OVERLAYS = 2;

const DividerWrapper = styled.div`
  background: ${({ theme }) => theme.mapOverlaySelector.divider};
`;

const Container = styled.div<{
  $isExpanded: boolean;
}>`
  width: ${({ theme }) => theme.mapOverlaySelector.width}px;
  pointer-events: auto;
  cursor: auto;
  min-height: 0; /* firefox vertical scroll */
  display: flex;
  flex-direction: column;
  height: ${({ $isExpanded }) => ($isExpanded ? '100%' : 'default')};
`;

const Header = styled(FlexSpaceBetween)`
  background: ${({ theme }) => theme.palette.secondary.main};
  color: #ffffff;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  padding: 2px 15px 2px 0;
  height: 40px;

  .MuiSvgIcon-root {
    font-size: 21px;
  }
`;

const OverlayLibrary = styled(FlexSpaceBetween)<{
  $expanded: boolean;
}>`
  background: ${({ theme }) => theme.mapOverlaySelector.divider};
  color: ${({ $expanded, theme }) =>
    theme.mapOverlaySelector.library[$expanded ? 'expanded' : 'collapsed']};
  font-size: 12px;
  font-weight: 500;
  padding: 10px 0 10px 18px;
  border-bottom-left-radius: ${({ $expanded }) => (!$expanded ? '5px' : '0')};
  border-bottom-right-radius: ${({ $expanded }) => (!$expanded ? '5px' : '0')};
  transition: color 0.2s ease;

  &:hover {
    cursor: pointer;
    color: ${({ theme }) => theme.mapOverlaySelector.library.expanded};
  }
`;

const StyledPrimaryComponent = styled(Typography)`
  margin-left: 15px;
  padding: 0;
  font-size: 0.75rem;
  color: #ffffff;
  font-weight: 500;
`;

const StyledOptionComponent = styled(StyledPrimaryComponent)`
  margin: -0.1rem 0;
`;

const LayersIcon = styled(MuiLayersIcon)<{
  $expanded: boolean;
}>`
  font-size: 20px;
  margin-right: 7px;
  color: ${({ $expanded, theme }) => ($expanded ? theme.palette.secondary.main : 'default')};
`;

const DownArrowIconWrapper = styled.div<{
  $expanded: boolean;
}>`
  display: flex;
  padding: 0 14px 0 5px;
  .MuiSvgIcon-root {
    transition: transform 0.3s ease;
    transform: rotate(${({ $expanded }) => ($expanded ? '180deg' : '0deg')});
  }

  &:hover {
    color: ${({ $expanded, theme }) =>
      $expanded ? theme.mapOverlaySelector.library.expanded : 'default'};
  }
`;

const options = [] as string[];
for (let i = 1; i <= MAX_MAP_OVERLAYS; i++) {
  const newOption = `${i} map overlay${i > 1 ? 's' : ''}`;
  options.push(newOption);
}

const DatePickerWrapper = styled.div<{
  $hasOverlays: boolean;
}>`
  background: ${({ theme }) => theme.mapOverlaySelector.background};
  border-bottom-left-radius: ${({ $hasOverlays }) => ($hasOverlays ? '0px' : '5px')};
  border-bottom-right-radius: ${({ $hasOverlays }) => ($hasOverlays ? '0px' : '5px')};
`;

interface MapOverlayControlProps {
  emptyMessage: string;
  selectedMapOverlays: any[];
  children?: ReactNode | null;
  hasOverlays: boolean;
  maxSelectedOverlays: number;
  changeMaxSelectedOverlays: (maxSelectedOverlays: number) => void;
  pinnedOverlay?: string;
  setPinnedOverlay: (pinnedOverlay?: string) => void;
}

export const MapOverlayControl = ({
  emptyMessage,
  selectedMapOverlays = [],
  children = null,
  hasOverlays,
  maxSelectedOverlays,
  changeMaxSelectedOverlays,
  pinnedOverlay,
  setPinnedOverlay,
}: MapOverlayControlProps) => {
  /** This is a direct copy from the existing web-frontend. It will likely be refactored as this logic is brought in */
  const [isExpanded, setIsExpanded] = useState(false);
  const isMapOverlaySelected = selectedMapOverlays.length > 0;

  const toggleMeasures = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded, setIsExpanded]);
  const reorderedSelectedMapOverlays = useMemo(
    () =>
      pinnedOverlay
        ? selectedMapOverlays.sort(first => (first.mapOverlayCode === pinnedOverlay ? -1 : 1))
        : selectedMapOverlays,
    [selectedMapOverlays, pinnedOverlay],
  );

  return (
    <Container $isExpanded={isExpanded}>
      <Header>
        <DropDownMenu
          title="MAP OVERLAYS"
          selectedOptionIndex={maxSelectedOverlays - 1}
          options={options}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          onChange={changeMaxSelectedOverlays}
          StyledPrimaryComponent={StyledPrimaryComponent}
          StyledOptionComponent={StyledOptionComponent}
          disableGutters
        />
        {/** This is where the map table modal would go */}
      </Header>
      <DatePickerWrapper $hasOverlays={hasOverlays}>
        {isMapOverlaySelected ? (
          reorderedSelectedMapOverlays.map((mapOverlay, index) => (
            <div key={mapOverlay.mapOverlayCode}>
              {/** This is where the title and date picker would go */}
              {index < selectedMapOverlays.length - 1 && <Divider />}
            </div>
          ))
        ) : (
          <Content>
            <EmptyContentText>{emptyMessage}</EmptyContentText>
          </Content>
        )}
      </DatePickerWrapper>
      {hasOverlays && (
        <OverlayLibrary $expanded={isExpanded} onClick={toggleMeasures}>
          <FlexStart>
            <LayersIcon $expanded={isExpanded} />
            OVERLAY LIBRARY
          </FlexStart>
          <DownArrowIconWrapper $expanded={isExpanded}>
            <DownArrow />
          </DownArrowIconWrapper>
        </OverlayLibrary>
      )}
      {isExpanded && (
        <DividerWrapper>
          <Divider variant="middle" />
        </DividerWrapper>
      )}
      <Fade in={isExpanded} mountOnEnter unmountOnExit exit={false}>
        <ExpandedContent>{children}</ExpandedContent>
      </Fade>
      <LastUpdated />
    </Container>
  );
};
