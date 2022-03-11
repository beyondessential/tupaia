/**
 * Tupaia Web
 * Copyright (c) 2021 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FlexSpaceBetween, FlexStart } from '@tupaia/ui-components';
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
  background: ${MAP_OVERLAY_SELECTOR.subBackground};
`;

const Container = styled.div`
  width: ${CONTROL_BAR_WIDTH}px;
  pointer-events: auto;
  cursor: auto;
  min-height: 0; /* firefox vertical scroll */
  display: flex;
  flex-direction: column;
  height: ${({ $isExpanded }) => ($isExpanded ? '100%' : 'default')};
`;

const Header = styled(FlexSpaceBetween)`
  background: ${TUPAIA_ORANGE};
  color: #ffffff;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  padding: 2px 15px 2px 0;
  height: 40px;

  .MuiSvgIcon-root {
    font-size: 21px;
  }
`;

const OverlayLibrary = styled(FlexSpaceBetween)`
  background: ${MAP_OVERLAY_SELECTOR.subBackground};
  color: ${({ $expanded }) => ($expanded ? LIGHT_GREY : DARK_GREY)};
  font-size: 12px;
  font-weight: 500;
  padding: 10px 0 10px 18px;
  border-bottom-left-radius: ${({ $expanded }) => (!$expanded ? '5px' : '0')};
  border-bottom-right-radius: ${({ $expanded }) => (!$expanded ? '5px' : '0')};
  transition: color 0.2s ease;

  &:hover {
    cursor: pointer;
    color: ${LIGHT_GREY};
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

const LayersIcon = styled(MuiLayersIcon)`
  font-size: 20px;
  margin-right: 7px;
  color: ${({ $expanded }) => ($expanded ? TUPAIA_ORANGE : 'default')};
`;

const DownArrowIconWrapper = styled.div`
  display: flex;
  padding: 0 14px 0 5px;
  .MuiSvgIcon-root {
    transition: transform 0.3s ease;
    transform: rotate(${({ $expanded }) => ($expanded ? '180deg' : '0deg')});
  }

  &:hover {
    color: ${({ $expanded }) => ($expanded ? LIGHT_GREY : 'default')};
  }
`;

const options = [];
for (let i = 1; i <= MAX_MAP_OVERLAYS; i++) {
  const newOption = `${i} map overlay${i > 1 ? 's' : ''}`;
  options.push(newOption);
}

const DatePickerWrapper = styled.div`
  background: ${MAP_OVERLAY_SELECTOR.background};
  border-bottom-left-radius: ${props => (props.$hasChildren ? '0px' : '5px')};
  border-bottom-right-radius: ${props => (props.$hasChildren ? '0px' : '5px')};
`;

export const Control = ({
  emptyMessage,
  selectedMapOverlays,
  children,
  maxSelectedOverlays,
  changeMaxSelectedOverlays,
  pinnedOverlay,
  setPinnedOverlay,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMapOverlaySelected = selectedMapOverlays.length > 0;
  const hasChildren = !!children;

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
        <MapTableModal />
      </Header>
      <DatePickerWrapper $hasChildren={hasChildren}>
        {isMapOverlaySelected ? (
          reorderedSelectedMapOverlays.map((mapOverlay, index) => (
            <div key={mapOverlay.mapOverlayCode}>
              <TitleAndDatePicker
                mapOverlay={mapOverlay}
                maxSelectedOverlays={maxSelectedOverlays}
                pinnedOverlay={pinnedOverlay}
                setPinnedOverlay={setPinnedOverlay}
              />
              {index < selectedMapOverlays.length - 1 && <Divider />}
            </div>
          ))
        ) : (
          <Content>
            <EmptyContentText>{emptyMessage}</EmptyContentText>
          </Content>
        )}
      </DatePickerWrapper>
      {hasChildren && (
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
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  maxSelectedOverlays: PropTypes.number.isRequired,
  changeMaxSelectedOverlays: PropTypes.func.isRequired,
  pinnedOverlay: PropTypes.string,
  setPinnedOverlay: PropTypes.func.isRequired,
};

Control.defaultProps = {
  selectedMapOverlays: [],
  pinnedOverlay: null,
  children: null,
};
