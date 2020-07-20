/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DateRangeIcon from '@material-ui/icons/DateRange';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import MuiIconButton from '@material-ui/core/IconButton';
import styled from 'styled-components';
import { DIALOG_Z_INDEX } from '../../styles';
import { Error } from '../Error';
import { DayPicker } from './DayPicker';
import { MonthPicker } from './MonthPicker';
import { QuarterPicker } from './QuarterPicker';
import { WeekPicker } from './WeekPicker';
import { YearPicker } from './YearPicker';
import {
  GRANULARITIES,
  GRANULARITIES_WITH_ONE_DATE,
  GRANULARITY_CONFIG,
  GRANULARITY_SHAPE,
  roundStartEndDates,
} from '../../utils/periodGranularities';

const {
  DAY,
  WEEK,
  SINGLE_WEEK,
  MONTH,
  SINGLE_MONTH,
  QUARTER,
  SINGLE_QUARTER,
  YEAR,
  SINGLE_YEAR,
} = GRANULARITIES;

const DEFAULT_GRANULARITY = GRANULARITY_CONFIG[DAY];

const StyledDateRow = styled.div`
  display: flex;
  margin-top: 30px;
`;

const getLabelText = granularity => {
  switch (granularity) {
    default:
      return 'Select Dates';
    case SINGLE_WEEK:
      return 'Select Week';
    case SINGLE_MONTH:
      return 'Select Month';
    case SINGLE_YEAR:
      return 'Select Year';
  }
};

const DayPickerRow = props => (
  <StyledDateRow>
    <DayPicker {...props} />
    <MonthPicker {...props} />
    <YearPicker {...props} />
  </StyledDateRow>
);

const WeekPickerRow = props => (
  <StyledDateRow>
    <WeekPicker {...props} />
    <YearPicker {...props} isIsoYear />
  </StyledDateRow>
);

const MonthPickerRow = props => (
  <StyledDateRow>
    <MonthPicker {...props} />
    <YearPicker {...props} />
  </StyledDateRow>
);

const QuarterPickerRow = props => (
  <StyledDateRow>
    <QuarterPicker {...props} />
    <YearPicker {...props} />
  </StyledDateRow>
);

const YearPickerRow = props => (
  <StyledDateRow>
    <YearPicker {...props} />
  </StyledDateRow>
);

// Todo: maybe this can be refactored?
// eslint-disable-next-line react/prop-types
const DateRow = ({ date, granularity, onChange }) => {
  const minMomentDate = moment('20150101');
  const pickerRowProps = {
    momentDateValue: date,
    minMomentDate: minMomentDate,
    maxMomentDate: moment(),
    onChange: onChange,
  };
  switch (granularity) {
    default:
    case DAY:
      return <DayPickerRow {...pickerRowProps} />;
    case SINGLE_WEEK:
    case WEEK:
      return <WeekPickerRow {...pickerRowProps} />;
    case MONTH:
    case SINGLE_MONTH:
      return <MonthPickerRow {...pickerRowProps} />;
    case QUARTER:
    case SINGLE_QUARTER:
      return <QuarterPickerRow {...pickerRowProps} />;
    case YEAR:
    case SINGLE_YEAR:
      return <YearPickerRow {...pickerRowProps} />;
  }
};

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const IconButton = styled(MuiIconButton)`
  color: white;
`;

const Label = styled.div`
  color: white;
  font-size: 16px;
  line-height: 19px;
`;

// eslint-disable-next-line react/prop-types
const DateLabel = ({ isSingleDate, granularity, startDate, endDate }) => {
  if (!startDate || !endDate) {
    return <Label>{getLabelText(granularity)}</Label>;
  }

  const { momentUnit, rangeFormat } = GRANULARITY_CONFIG[granularity] || DEFAULT_GRANULARITY;
  const formattedStartDate = startDate.format(rangeFormat);
  const formattedEndDate = endDate.startOf(momentUnit).format(rangeFormat);

  const label = isSingleDate ? formattedStartDate : `${formattedStartDate} - ${formattedEndDate}`;

  return <Label>{label}</Label>;
};

export const DateRangePicker = ({ startDate, endDate, granularity, onSetDates, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(moment(startDate));
  const [selectedEndDate, setSelectedEndDate] = useState(moment(endDate));
  const [errorMessage, setErrorMessage] = useState('');

  const isSingleDate = GRANULARITIES_WITH_ONE_DATE.includes(granularity);

  // Number of periods to move may be negative if changing to the previous period
  const changePeriod = numberOfPeriodsToMove => {
    if (!isSingleDate) {
      throw new Error('Can only change period for single unit date pickers (e.g. one month)');
    }

    const { momentShorthand } = GRANULARITY_CONFIG[granularity];
    setSelectedStartDate(selectedStartDate.clone().add(numberOfPeriodsToMove, momentShorthand));
    setSelectedEndDate(selectedEndDate.clone().add(numberOfPeriodsToMove, momentShorthand));
    onSetDates(selectedStartDate, selectedEndDate);
  };

  const onCancelDateSelection = () => {
    setIsOpen(false);
    setErrorMessage('');
  };

  const onSubmitDateSelection = () => {
    if (!isSingleDate && selectedStartDate.isAfter(selectedEndDate)) {
      return setErrorMessage('Start date must be before end date');
    }

    const { roundedStartDate, roundedEndDate } = roundStartEndDates(
      granularity,
      isSingleDate ? selectedEndDate.clone() : selectedStartDate,
      selectedEndDate,
    );

    // Only update if the dates have actually changed by at least one day
    if (
      !roundedStartDate.isSame(selectedStartDate, 'day') ||
      !roundedEndDate.isSame(selectedEndDate, 'day')
    ) {
      // Update the external control values!
      onSetDates(selectedStartDate, selectedEndDate);
    }
    // Close the dialog
    setIsOpen(false);
    return setErrorMessage('');
  };

  return (
    <FlexRow>
      <FlexRow>
        <IconButton onClick={() => setIsOpen(true)} aria-label="open">
          <DateRangeIcon />
        </IconButton>
        <FlexRow>
          <DateLabel
            isSingleDate={isSingleDate}
            granularit={granularity}
            startDate={selectedStartDate}
            endDate={selectedEndDate}
          />
        </FlexRow>
        {isSingleDate && (
          <FlexRow>
            <IconButton type="button" onClick={() => changePeriod(-1)} disabled={isLoading}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton type="button" onClick={() => changePeriod(1)} disabled={isLoading}>
              <ChevronRightIcon />
            </IconButton>
          </FlexRow>
        )}
      </FlexRow>
      <Dialog
        modal="true"
        open={isOpen}
        style={{ zIndex: DIALOG_Z_INDEX + 1 }}
        PaperProps={{ style: { width: '75%', maxWidth: '700px' } }}
      >
        <DialogTitle>{getLabelText(granularity)}</DialogTitle>
        <DialogContent>
          {!isSingleDate && (
            <DateRow
              granularity={granularity}
              date={selectedStartDate}
              onChange={setSelectedStartDate}
            />
          )}
          <DateRow granularity={granularity} date={selectedEndDate} onChange={setSelectedEndDate} />
          {errorMessage ? <Error>{errorMessage}</Error> : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancelDateSelection}>Cancel</Button>
          <Button color="primary" onClick={onSubmitDateSelection} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </FlexRow>
  );
};

DateRangePicker.propTypes = {
  startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  granularity: GRANULARITY_SHAPE,
  onSetDates: PropTypes.func,
  isLoading: PropTypes.bool,
};

DateRangePicker.defaultProps = {
  startDate: {},
  endDate: {},
  granularity: DAY,
  onSetDates: () => {},
  isLoading: false,
};
