/**
 * Tupaia Web
 * Copyright (c) 2021 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiLayersIcon from '@material-ui/icons/Layers';
import DownArrow from '@material-ui/icons/ArrowDropDown';
import { Fade, Typography, Divider } from '@material-ui/core';
import LastUpdated from './LastUpdated';
import {
  CONTROL_BAR_WIDTH,
  MAP_OVERLAY_SELECTOR,
  TUPAIA_ORANGE,
  LIGHT_GREY,
  DARK_GREY,
} from '../../styles';
import { Content, EmptyContentText, ExpandedContent } from './Content';
import { MapTableModal } from '../MapTableModal';
import { TitleAndDatePicker } from './TitleAndDatePicker';
import { DropDownMenu } from '../../components/DropDownMenu';

const MAX_MAP_OVERLAYS = 2;

const DividerWrapper = styled.div`
  background: ${MAP_OVERLAY_SELECTOR.subBackGround};
`;

const Container = styled.div`
  width: ${CONTROL_BAR_WIDTH}px;
  pointer-events: auto;
  cursor: auto;
  min-height: 0; /* firefox vertical scroll */
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  background: ${TUPAIA_ORANGE};
  color: #ffffff;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  padding: 2px 15px 0;
  height: 40px;
  justify-content: space-between;

  .MuiSvgIcon-root {
    font-size: 21px;
  }
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const OverlayLibrary = styled.div`
  background: ${MAP_OVERLAY_SELECTOR.subBackGround};
  display: flex;
  justify-content: space-between;
  color: ${({ expanded }) => (expanded ? LIGHT_GREY : DARK_GREY)};
  font-size: 12px;
  font-weight: 500;
  padding: 8px 4px;
  &:hover {
    cursor: pointer;
    color: ${LIGHT_GREY};
  }
  border-bottom-left-radius: ${({ expanded }) => (!expanded ? '5px' : '0')};
  border-bottom-right-radius: ${({ expanded }) => (!expanded ? '5px' : '0')};
`;

const OverlayLibraryHeader = styled.div`
  display: flex;
  align-items: center;
`;

const StyledPrimaryComponent = styled(Typography)`
  margin: 0;
  padding: 0;
  font-size: 0.75rem;
  color: #ffffff;
  font-weight: 500;
`;

const StyledOptionComponent = styled(StyledPrimaryComponent)`
  margin: -0.1rem 0;
`;

const LayersIcon = styled(MuiLayersIcon)`
  font-size: 20px;
  margin-left: 11px;
  margin-right: 6px;
  color: ${({ $expanded }) => ($expanded ? TUPAIA_ORANGE : 'default')};
`;

const DownArrowIconWrapper = styled.div`
  display: flex;
  padding: 8px 14px 0 5px;
  .MuiSvgIcon-root {
    transition: transform 0.3s ease;
    transform: rotate(${({ expanded }) => (expanded ? '180deg' : '0deg')});
  }

  &:hover: {
    color: ${TUPAIA_ORANGE};
  }
`;

const options = [];
for (let i = 1; i <= MAX_MAP_OVERLAYS; i++) {
  const newOption = `${i} map overlay${i > 1 ? 's' : ''}`;
  options.push(newOption);
}

const DatePickerWrapper = styled.div`
  display: block;
  background: ${MAP_OVERLAY_SELECTOR.background};
`;

export const Control = ({
  emptyMessage,
  selectedMapOverlays,
  isMeasureLoading,
  onUpdateOverlayPeriod,
  children,
  maxSelectedOverlays,
  changeMaxSelectedOverlays,
  pinnedOverlay,
  setPinnedOverlay,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMapOverlaySelected = selectedMapOverlays.length > 0;
  const toggleMeasures = useCallback(() => {
    if (isExpanded) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  }, [isExpanded, setIsExpanded]);

  const reorderedSelectedMapOverlays = useMemo(() => {
    const results = [];
    if (!pinnedOverlay) {
      return selectedMapOverlays;
    }

    selectedMapOverlays.forEach(overlay => {
      if (overlay.mapOverlayCode === pinnedOverlay) {
        results.unshift(overlay);
      } else results.push(overlay);
    });

    return results;
  }, [selectedMapOverlays, pinnedOverlay]);

  return (
    <Container>
      <Header>
        <Wrapper>
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
        </Wrapper>
        <MapTableModal />
      </Header>
      <DatePickerWrapper>
        {isMapOverlaySelected ? (
          reorderedSelectedMapOverlays.map((mapOverlay, index) => (
            <div key={mapOverlay.mapOverlayCode}>
              <TitleAndDatePicker
                mapOverlay={mapOverlay}
                onUpdateOverlayPeriod={onUpdateOverlayPeriod}
                isMapOverlaySelected={isMapOverlaySelected}
                isMeasureLoading={isMeasureLoading}
                pinnedOverlay={pinnedOverlay}
                setPinnedOverlay={setPinnedOverlay}
              />
              {index !== selectedMapOverlays.length - 1 && <Divider />}
            </div>
          ))
        ) : (
          <Content>
            <EmptyContentText>{emptyMessage}</EmptyContentText>
          </Content>
        )}
      </DatePickerWrapper>
      <OverlayLibrary expanded={isExpanded} onClick={toggleMeasures}>
        <OverlayLibraryHeader>
          <LayersIcon $expanded={isExpanded} />
          OVERLAY LIBRARY
        </OverlayLibraryHeader>
        <DownArrowIconWrapper expanded={isExpanded}>
          <DownArrow />
        </DownArrowIconWrapper>
      </OverlayLibrary>
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

Control.propTypes = {
  selectedMapOverlays: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      periodGranularity: PropTypes.string,
      isTimePeriodEditable: PropTypes.bool,
      datePickerLimits: PropTypes.shape({
        startDate: PropTypes.object,
        endDate: PropTypes.object,
      }),
      startDate: PropTypes.shape({}),
      endDate: PropTypes.shape({}),
    }),
  ),
  emptyMessage: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  isMeasureLoading: PropTypes.bool,
  onUpdateOverlayPeriod: PropTypes.func.isRequired,
  maxSelectedOverlays: PropTypes.number.isRequired,
  changeMaxSelectedOverlays: PropTypes.func.isRequired,
  pinnedOverlay: PropTypes.string,
  setPinnedOverlay: PropTypes.func.isRequired,
};

Control.defaultProps = {
  selectedMapOverlays: [],
  isMeasureLoading: false,
  pinnedOverlay: null,
};
