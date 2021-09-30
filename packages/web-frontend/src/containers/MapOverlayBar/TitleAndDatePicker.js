import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import moment from 'moment';
import DownArrow from '@material-ui/icons/ArrowDropDown';
import CircularProgress from '@material-ui/core/CircularProgress';
import { DateRangePicker } from '../../components/DateRangePicker';
import { getDefaultDates, getLimits, GRANULARITY_CONFIG } from '../../utils/periodGranularities';
import { Content, ContentText } from './Styles';

const IconWrapper = styled.div`
  display: flex;
  border-left: 1px solid rgba(255, 255, 255, 0.5);
  padding: 2px 0 2px 10px;
`;

const MeasureDatePicker = styled.div`
  pointer-events: auto;
  background: #203e5c;
  padding: 16px 8px;
  border-bottom-left-radius: ${({ expanded }) => (!expanded ? '5px' : '0')};
  border-bottom-right-radius: ${({ expanded }) => (!expanded ? '5px' : '0')};
`;

export const TitleAndDatePicker = ({
  mapOverlay,
  onUpdateMeasurePeriod,
  isExpanded,
  isMeasureSelected,
  toggleMeasures,
  isMeasureLoading,
}) => {
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
      <Content
        expanded={isExpanded}
        selected={isMeasureSelected}
        period={periodGranularity}
        onClick={toggleMeasures}
      >
        <ContentText>{isMeasureLoading ? <CircularProgress size={22} /> : name}</ContentText>
        <IconWrapper>
          <DownArrow />
        </IconWrapper>
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

TitleAndDatePicker.propTypes = {
  mapOverlay: PropTypes.shape({
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
  isExpanded: PropTypes.func.isRequired,
  isMeasureSelected: PropTypes.string.isRequired,
  toggleMeasures: PropTypes.string.isRequired,
  isMeasureLoading: PropTypes.bool,
  onUpdateMeasurePeriod: PropTypes.func.isRequired,
};

TitleAndDatePicker.defaultProps = {
  isMeasureLoading: false,
};
