/**
 * Tupaia Web
 * Copyright (c) 2021 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import LayersIcon from '@material-ui/icons/Layers';
import { Fade, Typography } from '@material-ui/core';
import LastUpdated from './LastUpdated';
import { CONTROL_BAR_WIDTH, TUPAIA_ORANGE } from '../../styles';
import { Content, EmptyContentText, ExpandedContent } from './Content';
import { MapTableModal } from '../MapTableModal';
import { TitleAndDatePicker } from './TitleAndDatePicker';
import { DropDownMenu } from '../../components/DropDownMenu';

const MAX_MAP_OVERLAYS = 2;

const Container = styled.div`
  width: ${CONTROL_BAR_WIDTH}px;
  cursor: auto;
  min-height: 0; /* firefox vertical scroll */
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  pointer-events: auto;
  background: ${TUPAIA_ORANGE};
  color: #ffffff;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  padding: 2px 15px 0;
  height: 40px;
  justify-content: space-between;

  .MuiSvgIcon-root {
    font-size: 21px;
    margin-right: 5px;
  }
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const SubHeader = styled.div`
  color: ${TUPAIA_ORANGE};
  font-size: 12px;
  font-weight: 500;
  padding: 4px;
  text-transform: uppercase;
  margin-bottom: 10px;
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

const options = [];
for (let i = 1; i <= MAX_MAP_OVERLAYS; i++) {
  const newOption = `${i} map overlay${i > 1 ? 's' : ''}`;
  options.push(newOption);
}

export const Control = ({
  emptyMessage,
  selectedMapOverlays,
  isMeasureLoading,
  onUpdateOverlayPeriod,
  children,
  maxSelectedOverlays,
  changeMaxSelectedOverlays,
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

  return (
    <Container>
      <Header>
        <Wrapper>
          <LayersIcon />
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
      {isMapOverlaySelected ? (
        selectedMapOverlays.map(mapOverlay => (
          <TitleAndDatePicker
            key={mapOverlay.mapOverlayCode}
            mapOverlay={mapOverlay}
            onUpdateOverlayPeriod={onUpdateOverlayPeriod}
            isExpanded={isExpanded}
            isMapOverlaySelected={isMapOverlaySelected}
            toggleMeasures={toggleMeasures}
            isMeasureLoading={isMeasureLoading}
          />
        ))
      ) : (
        <Content>
          <EmptyContentText>{emptyMessage}</EmptyContentText>
        </Content>
      )}
      <Fade in={isExpanded} mountOnEnter unmountOnExit exit={false}>
        <ExpandedContent>
          <SubHeader>Select an overlay</SubHeader>
          {children}
        </ExpandedContent>
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
};

Control.defaultProps = {
  selectedMapOverlays: [],
  isMeasureLoading: false,
};
