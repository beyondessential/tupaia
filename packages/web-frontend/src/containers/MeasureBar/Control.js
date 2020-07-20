import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Layers from '@material-ui/icons/Layers';
import UpArrow from '@material-ui/icons/ArrowDropUp';
import DownArrow from '@material-ui/icons/ArrowDropDown';
import CircularProgress from '@material-ui/core/CircularProgress';

import { DateRangePicker, NewDateRangePicker } from '../../components/DateRangePicker';
import { CONTROL_BAR_WIDTH, TUPAIA_ORANGE, MAP_OVERLAY_SELECTOR } from '../../styles';

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
  background: ${TUPAIA_ORANGE};
  color: #ffffff;
  text-transform: uppercase;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  padding: 8px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
`;

const Content = styled.div`
  background: ${MAP_OVERLAY_SELECTOR.background};
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom-left-radius: ${({ expanded, selected, period }) =>
    !expanded && (!selected || !period) ? '5px' : '0px'};
  border-bottom-right-radius: ${({ expanded, selected, period }) =>
    !expanded && (!selected || !period) ? '5px' : '0px'};

  svg {
    margin: 8px;
    border-left: 1px solid white;
    padding-left: 3px;
  }
`;

const ContentText = styled.div`
  padding: 8px;
  min-height: ${({ selected }) => (!selected ? '40px' : 'inherit')};
`;

const SubHeader = styled.div`
  color: ${TUPAIA_ORANGE};
  font-size: 0.7rem;
  font-weight: 400;
  padding: 4px;
  text-transform: uppercase;
`;

const MeasureDatePicker = styled.div`
  background: #203e5c;
  //padding: 16px 8px;
  //display: flex;
  //justify-content: center;
  border-bottom-left-radius: ${({ expanded }) => (!expanded ? '5px' : '0px')};
  border-bottom-right-radius: ${({ expanded }) => (!expanded ? '5px' : '0px')};
`;

const ExpandedContent = styled.div`
  background: #203e5c;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  color: #fff;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  overflow-y: auto;
  padding: 8px;
  flex-basis: 0;
  flex-grow: 1;
`;

const ExpansionControl = ({ isExpanded, expand, minimise }) =>
  isExpanded ? (
    <UpArrow onClick={minimise} fontSize="large" />
  ) : (
    <DownArrow onClick={expand} fontSize="large" />
  );

ExpansionControl.propTypes = {
  isExpanded: PropTypes.bool.isRequired,
  expand: PropTypes.func.isRequired,
  minimise: PropTypes.func.isRequired,
};

export const Control = ({
  emptyMessage,
  selectedMeasure,
  isMeasureLoading,
  onUpdateMeasurePeriod,
  children,
}) => {
  const isMeasureSelected = !!selectedMeasure.name;
  const measureText = selectedMeasure.name || emptyMessage;

  const [isExpanded, handleExpansion] = useState(false);
  const expandMeasures = useCallback(() => handleExpansion(true), [isExpanded]);
  const minimiseMeasures = useCallback(() => handleExpansion(false), [isExpanded]);

  const updateMeasurePeriod = (startDate, endDate) => {
    console.log('start date', startDate.toString());
    console.log('end date', endDate.toString());
    onUpdateMeasurePeriod(startDate, endDate);
  };

  return (
    <Container>
      <Header>
        <Layers />
        &nbsp; Map overlays &nbsp;
        {isMeasureLoading && <CircularProgress size={24} thickness={3} />}
      </Header>
      <Content
        expanded={isExpanded}
        selected={isMeasureSelected}
        period={selectedMeasure.periodGranularity}
      >
        <ContentText selected={isMeasureSelected}>
          {isMeasureLoading ? '' : measureText}
        </ContentText>
        {isMeasureSelected && (
          <ExpansionControl
            isExpanded={isExpanded}
            expand={expandMeasures}
            minimise={minimiseMeasures}
          />
        )}
      </Content>
      {isMeasureSelected && selectedMeasure.periodGranularity && (
        <MeasureDatePicker expanded={isExpanded}>
          <NewDateRangePicker
            granularity={selectedMeasure.periodGranularity}
            startDate={selectedMeasure.startDate}
            endDate={selectedMeasure.endDate}
            onSetDates={updateMeasurePeriod}
            isLoading={isMeasureLoading}
          />
        </MeasureDatePicker>
      )}

      {isExpanded && (
        <ExpandedContent>
          <SubHeader>Select an overlay</SubHeader>
          {children}
        </ExpandedContent>
      )}
    </Container>
  );
};

Control.propTypes = {
  selectedMeasure: PropTypes.shape({
    name: PropTypes.string,
    periodGranularity: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }),
  emptyMessage: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  isMeasureLoading: PropTypes.bool,
  onUpdateMeasurePeriod: PropTypes.func.isRequired,
};

Control.defaultProps = {
  isMeasureLoading: false,
  selectedMeasure: {},
};
