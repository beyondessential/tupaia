import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { FlexSpaceBetween as FlexSpaceBetweenCenter } from '@tupaia/ui-components';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import moment from 'moment';
import {
  CircularProgress as MuiCircularProgress,
  Box as MuiBox,
  Switch as MuiSwitch,
} from '@material-ui/core';
import { Skeleton as MuiSkeleton } from '@material-ui/lab';
import { DateRangePicker } from '../../components/DateRangePicker';
import { getDefaultDates, getLimits, GRANULARITY_CONFIG } from '../../utils/periodGranularities';
import { Content, ContentText } from './Content';
import { MAP_OVERLAY_SELECTOR, TUPAIA_ORANGE } from '../../styles';
import { setDisplayedMapOverlays } from '../../actions';
import { Pin as PinBase } from './Pin';

const FlexSpaceBetween = styled(FlexSpaceBetweenCenter)`
  align-items: flex-start;
`;

const Switch = styled(MuiSwitch)`
  height: 16px;
  width: 37px;
  padding: 1px;
  margin-top: 2px;

  .MuiSwitch-switchBase {
    color: #315c88;
    padding: 0;
    margin: 0;
  }

  .Mui-checked {
    color: ${TUPAIA_ORANGE};
    + .MuiSwitch-track {
      background-color: ${TUPAIA_ORANGE};
    }
  }

  .MuiSwitch-thumb {
    width: 16px;
    height: 16px;
  }
`;

const Box = styled(MuiBox)`
  margin-left: ${props => (props.$isPinShowed ? '47px' : '18px')};
  padding: 0;
  min-height: 60px;
`;

const BoxContent = styled(Content)`
  align-items: center;
  justify-content: flex-start;
`;

const Wrapper = styled.div`
  background: ${MAP_OVERLAY_SELECTOR.background};
`;

const Pin = styled(PinBase)`
  margin: 3px 12px 0 7px;
`;

const CircularProgress = styled(MuiCircularProgress)`
  color: #2196f3;
  margin-right: 7px;
`;

const Skeleton = styled(MuiSkeleton)`
  background: none;
  margin-left: ${({ ml = 0 }) => ml}px;
  margin-top: ${({ mt = 0 }) => mt}px;

  .MuiSkeleton-text {
    transform: scale(1, 1);
  }
`;

export const TitleAndDatePickerComponent = ({
  mapOverlay,
  onUpdateOverlayPeriod,
  isMeasureLoading,
  displayedMapOverlays,
  onSetDisplayedMapOverlay,
  pinnedOverlay,
  setPinnedOverlay,
  maxSelectedOverlays,
}) => {
  const [isSwitchedOn, setIsSwitchedOn] = useState(true);

  useEffect(() => {
    setIsSwitchedOn(displayedMapOverlays.includes(mapOverlay.mapOverlayCode));
  }, [JSON.stringify(displayedMapOverlays)]);

  const { periodGranularity, isTimePeriodEditable = true, name, mapOverlayCode } = mapOverlay;
  const defaultDates = getDefaultDates(mapOverlay);
  const datePickerLimits = getLimits(periodGranularity, mapOverlay.datePickerLimits);
  const showDatePicker = !!(isTimePeriodEditable && periodGranularity);
  // Map overlays always have initial dates, so DateRangePicker always has dates on initialisation,
  // and uses those rather than calculating it's own defaults
  const startDate = mapOverlay.startDate || defaultDates.startDate;
  const endDate = mapOverlay.endDate || defaultDates.endDate;
  const isPinned = pinnedOverlay === mapOverlayCode;
  const isPinShowed = maxSelectedOverlays > 1;

  const handleSwitchChange = () => {
    const newDisplayedOverlays = isSwitchedOn
      ? displayedMapOverlays.filter(code => code !== mapOverlayCode)
      : [...displayedMapOverlays, mapOverlayCode];
    onSetDisplayedMapOverlay(newDisplayedOverlays);
    setIsSwitchedOn(!isSwitchedOn);
  };

  const updateMeasurePeriod = (startDate, endDate) => {
    const period = GRANULARITY_CONFIG[periodGranularity].momentUnit;
    onUpdateOverlayPeriod(mapOverlayCode, {
      startDate: moment(startDate).startOf(period),
      endDate: moment(endDate).endOf(period),
    });
  };

  const handlePinChange = () => {
    setPinnedOverlay(mapOverlayCode);
  };

  return (
    <Wrapper>
      {isMeasureLoading ? (
        <BoxContent>
          {isPinShowed && <CircularProgress size={21} thickness={7} />}
          <Skeleton animation="wave" width={270} height={21} />
        </BoxContent>
      ) : (
        <Content>
          <FlexSpaceBetween>
            {isPinShowed && <Pin isPinned={isPinned} onChange={handlePinChange} />}
            <ContentText>{name}</ContentText>
          </FlexSpaceBetween>
          <Switch checked={isSwitchedOn} onChange={handleSwitchChange} />
        </Content>
      )}

      {showDatePicker && (
        <Box $isPinShowed={isPinShowed}>
          {isMeasureLoading ? (
            <>
              <Skeleton animation="wave" width={200} height={20} />
              <Skeleton animation="wave" width={100} height={14} mt={3} />
            </>
          ) : (
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
          )}
        </Box>
      )}
    </Wrapper>
  );
};

TitleAndDatePickerComponent.propTypes = {
  mapOverlay: PropTypes.shape({
    mapOverlayCode: PropTypes.string,
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
  isMeasureLoading: PropTypes.bool,
  onUpdateOverlayPeriod: PropTypes.func.isRequired,
  displayedMapOverlays: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSetDisplayedMapOverlay: PropTypes.func.isRequired,
  pinnedOverlay: PropTypes.string,
  setPinnedOverlay: PropTypes.func.isRequired,
  maxSelectedOverlays: PropTypes.number.isRequired,
};

TitleAndDatePickerComponent.defaultProps = {
  isMeasureLoading: false,
  pinnedOverlay: null,
};

const mapStateToProps = state => {
  const { displayedMapOverlays } = state.map;
  return { displayedMapOverlays };
};

const mapDispatchToProps = dispatch => ({
  onSetDisplayedMapOverlay: mapOverlayCodes => dispatch(setDisplayedMapOverlays(mapOverlayCodes)),
});

export const TitleAndDatePicker = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TitleAndDatePickerComponent);
