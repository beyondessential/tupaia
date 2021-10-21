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
import { MAX_MAP_OVERLAYS } from './constant';

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
  margin: 0 0 0 0;
  padding: 0px 0px 0px 0px;
  font-size: 0.75rem;
  color: #ffffff;
  font-weight: 500;
`;

const StyledOptionComponent = styled(Typography)`
  margin: -0.1rem 0;
  padding: 0px 0px 0px 0px;
  font-size: 0.75rem;
  color: #ffffff;
  font-weight: 500;
`;

export const Control = ({
  emptyMessage,
  selectedMapOverlays,
  isMeasureLoading,
  onUpdateMeasurePeriod,
  children,
  maxSelectedOverlays,
  setMaxSelectedOverlays,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMeasureSelected = selectedMapOverlays.length > 0;
  const toggleMeasures = useCallback(() => {
    if (isExpanded) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  }, [isExpanded, setIsExpanded]);

  const onChange = selectedIndex => {
    setMaxSelectedOverlays(selectedIndex + 1);
  };

  const options = [];
  for (let i = 1; i <= MAX_MAP_OVERLAYS; i++) {
    const newOption = `${i} map overlay${i > 1 ? 's' : ''}`;
    options.push(newOption);
  }

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
            onChange={onChange}
            StyledPrimaryComponent={StyledPrimaryComponent}
            StyledOptionComponent={StyledOptionComponent}
            disableGutters
          />
        </Wrapper>
        <MapTableModal />
      </Header>
      {isMeasureSelected ? (
        selectedMapOverlays.map((mapOverlay, index) => (
          <TitleAndDatePicker
            key={mapOverlay.mapOverlayCode}
            mapOverlay={mapOverlay}
            onUpdateMeasurePeriod={onUpdateMeasurePeriod}
            isExpanded={isExpanded}
            isMeasureSelected={isMeasureSelected}
            toggleMeasures={toggleMeasures}
            isMeasureLoading={isMeasureLoading}
            showDatePickerOnlyAfterSecondTitle={
              selectedMapOverlays.length === 2 ? index === 1 : true
            }
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
  onUpdateMeasurePeriod: PropTypes.func.isRequired,
  setMaxSelectedOverlays: PropTypes.func.isRequired,
  maxSelectedOverlays: PropTypes.number.isRequired,
};

Control.defaultProps = {
  selectedMapOverlays: [],
  isMeasureLoading: false,
};
