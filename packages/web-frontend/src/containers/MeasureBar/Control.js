import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import moment from 'moment';
import LayersIcon from '@material-ui/icons/Layers';
import DownArrow from '@material-ui/icons/ArrowDropDown';
import Fade from '@material-ui/core/Fade';
import CircularProgress from '@material-ui/core/CircularProgress';
import LastUpdated from './LastUpdated';
import { DateRangePicker } from '../../components/DateRangePicker';
import { CONTROL_BAR_WIDTH, TUPAIA_ORANGE, MAP_OVERLAY_SELECTOR } from '../../styles';
import { GRANULARITY_CONFIG } from '../../utils/periodGranularities';
import { MapTableModal } from '../MapTableModal';

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
  font-weight: 500;
  pointer-events: auto;
  background: ${TUPAIA_ORANGE};
  color: #ffffff;
  text-transform: uppercase;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  padding: 2px 15px 0;
  height: 40px;
  font-size: 0.75rem;
  align-items: center;

  .MuiSvgIcon-root {
    font-size: 21px;
    margin-right: 5px;
  }
`;

const Content = styled.div`
  display: flex;
  pointer-events: auto;
  padding: 12px 15px;
  background: ${MAP_OVERLAY_SELECTOR.background};
  color: #ffffff;
  justify-content: space-between;
  align-items: center;
  border-bottom-left-radius: ${({ expanded, selected, period }) =>
    !expanded && (!selected || !period) ? '5px' : '0'};
  border-bottom-right-radius: ${({ expanded, selected, period }) =>
    !expanded && (!selected || !period) ? '5px' : '0'};

  &:hover {
    cursor: pointer;
  }

  .MuiSvgIcon-root {
    transition: transform 0.3s ease;
    transform: rotate(${({ expanded }) => (expanded ? '180deg' : '0deg')});
  }
`;

const IconWrapper = styled.div`
  display: flex;
  border-left: 1px solid rgba(255, 255, 255, 0.5);
  padding: 2px 0 2px 10px;
`;

const ContentText = styled.div`
  font-size: 16px;
`;

const EmptyContentText = styled(ContentText)`
  padding-right: 6px;
`;

const SubHeader = styled.div`
  color: ${TUPAIA_ORANGE};
  font-size: 12px;
  font-weight: 500;
  padding: 4px;
  text-transform: uppercase;
  margin-bottom: 10px;
`;

const MeasureDatePicker = styled.div`
  pointer-events: auto;
  background: #203e5c;
  padding: 16px 8px;
  border-bottom-left-radius: ${({ expanded }) => (!expanded ? '5px' : '0')};
  border-bottom-right-radius: ${({ expanded }) => (!expanded ? '5px' : '0')};
`;

const ExpandedContent = styled.div`
  pointer-events: auto;
  background: #203e5c;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  color: #fff;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  overflow-y: auto;
  padding: 15px;
  flex-basis: 0;
  flex-grow: 1;
`;

export const Control = ({
  emptyMessage,
  selectedMeasure,
  showDatePicker,
  defaultDates,
  datePickerLimits,
  isMeasureLoading,
  onUpdateMeasurePeriod,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { periodGranularity } = selectedMeasure;
  const isMeasureSelected = !!selectedMeasure.name;
  const toggleMeasures = useCallback(() => {
    if (isExpanded) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  }, [isExpanded, setIsExpanded]);

  const updateMeasurePeriod = (startDate, endDate) => {
    const period = GRANULARITY_CONFIG[periodGranularity].momentUnit;
    onUpdateMeasurePeriod(moment(startDate).startOf(period), moment(endDate).endOf(period));
  };

  // Map overlays always have initial dates, so DateRangePicker always has dates on initialisation,
  // and uses those rather than calculating it's own defaults
  let { startDate, endDate } = selectedMeasure;
  if (!startDate) startDate = defaultDates.startDate;
  if (!endDate) endDate = defaultDates.endDate;

  return (
    <Container>
      <Header>
        <LayersIcon />
        Map overlays
        <MapTableModal />
      </Header>
      {!isMeasureSelected ? (
        <Content>
          <EmptyContentText>{emptyMessage}</EmptyContentText>
        </Content>
      ) : (
        <Content
          expanded={isExpanded}
          selected={isMeasureSelected}
          period={selectedMeasure.periodGranularity}
          onClick={toggleMeasures}
        >
          <ContentText>
            {isMeasureLoading ? <CircularProgress size={22} /> : selectedMeasure.name}
          </ContentText>
          <IconWrapper>
            <DownArrow />
          </IconWrapper>
        </Content>
      )}
      {showDatePicker && (
        <MeasureDatePicker expanded={isExpanded}>
          <DateRangePicker
            key={selectedMeasure.name} // force re-create the component on measure change, which resets initial dates
            granularity={selectedMeasure.periodGranularity}
            startDate={startDate}
            endDate={endDate}
            min={datePickerLimits.startDate}
            max={datePickerLimits.endDate}
            onSetDates={updateMeasurePeriod}
            isLoading={isMeasureLoading}
          />
        </MeasureDatePicker>
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
  selectedMeasure: PropTypes.shape({
    name: PropTypes.string,
    periodGranularity: PropTypes.string,
    startDate: PropTypes.shape({}),
    endDate: PropTypes.shape({}),
  }),
  showDatePicker: PropTypes.bool,
  defaultDates: PropTypes.shape({
    startDate: PropTypes.object,
    endDate: PropTypes.object,
  }).isRequired,
  datePickerLimits: PropTypes.shape({
    startDate: PropTypes.object,
    endDate: PropTypes.object,
  }),
  emptyMessage: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  isMeasureLoading: PropTypes.bool,
  onUpdateMeasurePeriod: PropTypes.func.isRequired,
};

Control.defaultProps = {
  isMeasureLoading: false,
  selectedMeasure: {},
  showDatePicker: false,
  datePickerLimits: {
    startDate: null,
    endDate: null,
  },
};
