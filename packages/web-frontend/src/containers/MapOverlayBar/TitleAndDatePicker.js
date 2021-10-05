import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import moment from 'moment';
import { withStyles } from '@material-ui/core/styles';
import DownArrow from '@material-ui/icons/ArrowDropDown';
import MuiSwitch from '@material-ui/core/Switch';
import CircularProgress from '@material-ui/core/CircularProgress';
import { DateRangePicker } from '../../components/DateRangePicker';
import { getDefaultDates, getLimits, GRANULARITY_CONFIG } from '../../utils/periodGranularities';
import { Content, ContentText } from './Styles';
import { TUPAIA_ORANGE } from '../../styles';
import { setDisplayedMapOverlay } from '../../actions';

const Switch = withStyles({
  switchBase: {
    '&$checked': {
      color: TUPAIA_ORANGE,
    },
    '&$checked + $track': {
      backgroundColor: TUPAIA_ORANGE,
    },
  },
  checked: {},
  track: {},
})(MuiSwitch);

const ToolsWrapper = styled.div`
  display: flex;
`;

const IconWrapper = styled.div`
  display: flex;
  border-left: 1px solid rgba(255, 255, 255, 0.5);
  padding: 8px 0 0 5px;
`;

const MeasureDatePicker = styled.div`
  pointer-events: auto;
  background: #203e5c;
  padding: 16px 8px;
  border-bottom-left-radius: ${({ expanded }) => (!expanded ? '5px' : '0')};
  border-bottom-right-radius: ${({ expanded }) => (!expanded ? '5px' : '0')};
`;

export const TitleAndDatePickerComponent = ({
  mapOverlay,
  onUpdateMeasurePeriod,
  isExpanded,
  isMeasureSelected,
  toggleMeasures,
  isMeasureLoading,
  displayedMapOverlays,
  onSetDisplayedMapOverlay,
}) => {
  const [isSwitchedOn, setIsSwitchedOn] = useState(true);
  useEffect(() => {
    setIsSwitchedOn(displayedMapOverlays.includes(mapOverlay?.mapOverlayId));
  }, [JSON.stringify(displayedMapOverlays)]);
  const switchOnChange = () => {
    if (isSwitchedOn) {
      onSetDisplayedMapOverlay(
        displayedMapOverlays.filter(mapOverlayId => mapOverlayId !== mapOverlay?.mapOverlayId),
      );
    } else {
      onSetDisplayedMapOverlay([...displayedMapOverlays, mapOverlay?.mapOverlayId]);
    }
    setIsSwitchedOn(!isSwitchedOn);
  };
  const { periodGranularity, isTimePeriodEditable = true, name } = mapOverlay;
  const defaultDates = getDefaultDates(mapOverlay);
  const datePickerLimits = getLimits(periodGranularity, mapOverlay.datePickerLimits);
  const showDatePicker = !!(isTimePeriodEditable && periodGranularity);
  const updateMeasurePeriod = (startDate, endDate) => {
    const period = GRANULARITY_CONFIG[periodGranularity].momentUnit;
    onUpdateMeasurePeriod(moment(startDate).startOf(period), moment(endDate).endOf(period));
  };
  // Map overlays always have initial dates, so DateRangePicker always has dates on initialisation,
  // and uses those rather than calculating it's own defaults
  const startDate = mapOverlay?.startDate || defaultDates.startDate;
  const endDate = mapOverlay?.endDate || defaultDates.endDate;
  return (
    <>
      <Content expanded={isExpanded} selected={isMeasureSelected} period={periodGranularity}>
        <ContentText>{isMeasureLoading ? <CircularProgress size={22} /> : name}</ContentText>
        <ToolsWrapper>
          <Switch
            checked={isSwitchedOn}
            onChange={() => {
              switchOnChange();
            }}
          />
          <IconWrapper onClick={toggleMeasures}>
            <DownArrow />
          </IconWrapper>
        </ToolsWrapper>
      </Content>
      {showDatePicker && (
        <MeasureDatePicker expanded={isExpanded}>
          <DateRangePicker
            key={name} // force re-create the component on measure change, which resets initial dates
            granularity={periodGranularity}
            startDate={startDate}
            endDate={endDate}
            min={datePickerLimits.startDate}
            max={datePickerLimits.endDate}
            onSetDates={updateMeasurePeriod}
            isLoading={isMeasureLoading}
          />
        </MeasureDatePicker>
      )}
    </>
  );
};

TitleAndDatePickerComponent.propTypes = {
  mapOverlay: PropTypes.shape({
    mapOverlayId: PropTypes.string,
    name: PropTypes.string,
    periodGranularity: PropTypes.string,
    isTimePeriodEditable: PropTypes.bool,
    datePickerLimits: PropTypes.shape({
      startDate: PropTypes.object,
      endDate: PropTypes.object,
    }),
    startDate: PropTypes.shape({}),
    endDate: PropTypes.shape({}),
  }).isRequired,
  isExpanded: PropTypes.bool.isRequired,
  isMeasureSelected: PropTypes.bool.isRequired,
  toggleMeasures: PropTypes.func.isRequired,
  isMeasureLoading: PropTypes.bool,
  onUpdateMeasurePeriod: PropTypes.func.isRequired,
  displayedMapOverlays: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSetDisplayedMapOverlay: PropTypes.func.isRequired,
};

TitleAndDatePickerComponent.defaultProps = {
  isMeasureLoading: false,
};

const mapStateToProps = state => {
  const { displayedMapOverlays } = state.map;
  return { displayedMapOverlays };
};

const mapDispatchToProps = dispatch => ({
  onSetDisplayedMapOverlay: mapOverlayIds => dispatch(setDisplayedMapOverlay(mapOverlayIds)),
});

export const TitleAndDatePicker = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TitleAndDatePickerComponent);
