import React from 'react';
import { connect } from 'react-redux';
import { FlexSpaceBetween as FlexSpaceBetweenCenter } from '@tupaia/ui-components';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  CircularProgress as MuiCircularProgress,
  Box as MuiBox,
  Switch as MuiSwitch,
} from '@material-ui/core';
import { Skeleton as MuiSkeleton } from '@material-ui/lab';
import { DateRangePicker } from '../../components/DateRangePicker';
import { Content, ContentText } from './Content';
import { MAP_OVERLAY_SELECTOR, TUPAIA_ORANGE } from '../../styles';
import { setDisplayedMapOverlays, updateOverlayConfigs } from '../../actions';
import { Pin } from './Pin';
import { Tooltip } from '../../components/Tooltip';
import { useOverlayDates } from './useOverlayDates';

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
  margin-left: ${props => (props.$isMultiOverlays ? '47px' : '18px')};
  margin-right: 10px;
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

const PinWrapper = styled.span`
  margin: 0px 10px 0 7px;
`;

const CircularProgress = styled(MuiCircularProgress)`
  color: #2196f3;
  margin-right: 7px;
`;

const Skeleton = styled(MuiSkeleton)`
  margin-left: ${({ ml = 0 }) => ml}px;
  margin-top: ${({ mt = 0 }) => mt}px;
  transform: scale(1, 1);
  ::after {
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
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
  const { name, mapOverlayCode } = mapOverlay;
  const {
    showDatePicker,
    startDate,
    endDate,
    minStartDate,
    maxEndDate,
    periodGranularity,
    setDates,
  } = useOverlayDates(mapOverlay, onUpdateOverlayPeriod);

  const isPinned = pinnedOverlay === mapOverlayCode;
  const isMultiOverlays = maxSelectedOverlays > 1;
  const isSwitchedOn = displayedMapOverlays.includes(mapOverlayCode) || !isMultiOverlays;
  const handleSwitchChange = () => {
    const newDisplayedOverlays = isSwitchedOn
      ? displayedMapOverlays.filter(code => code !== mapOverlayCode)
      : [...displayedMapOverlays, mapOverlayCode];
    onSetDisplayedMapOverlay(newDisplayedOverlays);
  };

  const handlePinChange = () => {
    setPinnedOverlay(mapOverlayCode);
  };

  return (
    <Wrapper>
      {isMeasureLoading ? (
        <BoxContent>
          {isMultiOverlays && <CircularProgress size={21} thickness={7} />}
          <Skeleton animation="wave" width={270} height={21} />
        </BoxContent>
      ) : (
        <Content>
          <FlexSpaceBetween>
            {isMultiOverlays && (
              <Tooltip
                arrow
                interactive
                placement="top"
                title={isPinned ? 'Unpin' : 'Pin and move to top'}
              >
                {/* PinWrapper is required to enable material-ui tooltip */}
                <PinWrapper>
                  <Pin isPinned={isPinned} onChange={handlePinChange} />
                </PinWrapper>
              </Tooltip>
            )}
            <ContentText>{name}</ContentText>
          </FlexSpaceBetween>
          {isMultiOverlays && <Switch checked={isSwitchedOn} onChange={handleSwitchChange} />}
        </Content>
      )}

      {showDatePicker && (
        <Box $isMultiOverlays={isMultiOverlays}>
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
              min={minStartDate}
              max={maxEndDate}
              onSetDates={setDates}
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
  const { displayedMapOverlays, isMeasureLoading } = state.map;
  const { isLoadingOrganisationUnit } = state.global;
  return { displayedMapOverlays, isMeasureLoading: isMeasureLoading || isLoadingOrganisationUnit };
};

const mapDispatchToProps = dispatch => ({
  onSetDisplayedMapOverlay: mapOverlayCodes => dispatch(setDisplayedMapOverlays(mapOverlayCodes)),
  onUpdateOverlayPeriod: (mapOverlayCode, overlayConfig) => {
    dispatch(updateOverlayConfigs({ [mapOverlayCode]: overlayConfig }));
  },
});

export const TitleAndDatePicker = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TitleAndDatePickerComponent);
