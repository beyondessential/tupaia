/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DateRangeIcon from '@material-ui/icons/DateRange';
import CircularProgress from '@material-ui/core/CircularProgress';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import { DIALOG_Z_INDEX, OFF_WHITE, WHITE } from '../../styles';
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
  <div style={styles.dateRow}>
    <DayPicker {...props} />
    <MonthPicker {...props} />
    <YearPicker {...props} />
  </div>
);

const WeekPickerRow = props => (
  <div style={styles.dateRow}>
    <WeekPicker {...props} />
    <YearPicker {...props} isIsoYear />
  </div>
);

const MonthPickerRow = props => (
  <div style={styles.dateRow}>
    <MonthPicker {...props} />
    <YearPicker {...props} />
  </div>
);

const QuarterPickerRow = props => (
  <div style={styles.dateRow}>
    <QuarterPicker {...props} />
    <YearPicker {...props} />
  </div>
);

const YearPickerRow = props => (
  <div style={styles.dateRow}>
    <YearPicker {...props} />
  </div>
);

const getBoundingDatesFromSelection = ({ isSingleDate, granularity, startDate, endDate }) => {
  const { startDate: fallbackStartDate, endDate: fallbackEndDate } = getCurrentDates();

  const { selectedStartDate, selectedEndDate } = state;

  const endDate = selectedEndDate || fallbackEndDate;
  const startDate = isSingleDate ? endDate.clone() : selectedStartDate || fallbackStartDate;

  // Round dates to the unit of granularity
  return roundStartEndDates(granularity, startDate, endDate);
};

const getDatesAsString = ({ isSingleDate, granularity, startDate, endDate }) => {
  if (!startDate || !endDate) {
    return getLabelText(granularity);
  }

  const { momentUnit, rangeFormat } = GRANULARITY_CONFIG[granularity] || DEFAULT_GRANULARITY;
  const formattedStartDate = startDate.format(rangeFormat);
  const formattedEndDate = endDate.startOf(momentUnit).format(rangeFormat);

  return isSingleDate ? formattedStartDate : `${formattedStartDate} - ${formattedEndDate}`;
};

export const DateRangePicker = ({ startDate: start, endDate: end, granularity, onSetDates }) => {
  // defaults. Do we need them? Are they being used?
  const minMomentDate = moment('20150101');
  const maxMomentDate = moment();
  const isSingleDate = GRANULARITIES_WITH_ONE_DATE.includes(granularity);
  const defaultStartDate = isSingleDate ? moment() : minMomentDate;
  const defaultEndDate = isSingleDate ? defaultStartDate : maxMomentDate;

  const startDate = start ? moment(start) : defaultStartDate;
  const endDate = end ? moment(end) : defaultEndDate;

  const defaultState = {
    isOpen: false,
    selectedStartDate: startDate,
    selectedEndDate: endDate,
    errorMessage: '',
  };

  const [state, setState] = useState(defaultState);

  onSubmitDateSelection(true);

  useEffect(onSubmitDateSelection, [selectedStartDate, selectedEndDate]);

  // Number of periods to move may be negative if changing to the previous period
  const changePeriod = numberOfPeriodsToMove => {
    if (!isSingleDate) {
      throw new Error('Can only change period for single unit date pickers (e.g. one month)');
    }

    const { momentShorthand } = GRANULARITY_CONFIG[granularity];
    setState({
      selectedStartDate: startDate.clone().add(numberOfPeriodsToMove, momentShorthand),
      selectedEndDate: endDate.clone().add(numberOfPeriodsToMove, momentShorthand),
    });
  };

  const onCancelDateSelection = () => {
    setState({ isOpen: false, errorMessage: '' });
    resetSelectedDates();
  };

  const onSubmitDateSelection = (forceSetDates = false) => {
    const { startDate, endDate } = getBoundingDatesFromSelection();

    if (startDate.isAfter(endDate)) {
      setState({
        errorMessage: 'Start date must be before end date',
      });
    } else {
      // Only update if the dates have actually changed by at least one day
      const { startDate: currentStartDate, endDate: currentEndDate } = getCurrentDates();
      if (
        forceSetDates ||
        !currentStartDate.isSame(startDate, 'day') ||
        !currentEndDate.isSame(endDate, 'day')
      ) {
        onSetDates(startDate, endDate);
      }
      // Close the dialog
      setState({ isOpen: false, errorMessage: '' });
    }
  };

  const resetSelectedDates = () => {
    const { startDate: selectedStartDate, endDate: selectedEndDate } = getCurrentDates();
    setState({
      selectedStartDate,
      selectedEndDate,
    });
  };

  const renderSelectedPeriodInfo = () => {
    const { isLoading, style } = props;
    const dateString = getDatesAsString();
    const buttonStyle = isLoading ? styles.button : { ...styles.button, ...styles.buttonBorder };
    return (
      <div style={{ ...styles.wrapper, ...style }}>
        {isSingleDate && (
          <button
            style={{ ...styles.button, ...styles.leftButton }}
            type="button"
            onClick={() => {
              changePeriod(-1);
            }}
            disabled={isLoading}
          >
            {'<'}
          </button>
        )}
        <button style={buttonStyle} type="button" onClick={() => setState({ isOpen: true })}>
          {isLoading ? (
            <CircularProgress style={styles.buttonIcon} size={15} thickness={2} />
          ) : (
            <DateRangeIcon style={styles.buttonIcon} />
          )}
          {dateString}
        </button>
        {isSingleDate && (
          <button
            style={{ ...styles.button, ...styles.rightButton }}
            type="button"
            onClick={() => {
              changePeriod(1);
            }}
            disabled={isLoading}
          >
            {'>'}
          </button>
        )}
      </div>
    );
  };

  const renderDateRow = (isEndDate = false) => {
    const { minMomentDate, maxMomentDate, defaultStartDate, defaultEndDate } = this;
    const { selectedStartDate = defaultStartDate, selectedEndDate = defaultEndDate } = state;
    const { granularity } = props;
    const dateValue = isEndDate ? selectedEndDate : selectedStartDate;

    const stateKey = isEndDate ? 'selectedEndDate' : 'selectedStartDate';

    const pickerRowProps = {
      momentDateValue: dateValue,
      minMomentDate: minMomentDate,
      maxMomentDate: maxMomentDate,
      onChange: newDate => setState({ [stateKey]: newDate }),
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

  const { style, granularity } = props;
  const { errorMessage } = state;

  return (
    <div style={{ ...styles.wrapper, ...style }}>
      {renderSelectedPeriodInfo()}
      <Dialog
        modal="true"
        open={state.isOpen}
        style={styles.dialog}
        PaperProps={{ style: styles.dialogContainer }}
      >
        <DialogTitle>{getLabelText(granularity)}</DialogTitle>
        <DialogContent>
          {!isSingleDate && renderDateRow()}
          {renderDateRow(true)}
          {errorMessage ? <Error>{errorMessage}</Error> : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancelDateSelection}>Cancel</Button>
          <Button color="primary" onClick={onSubmitDateSelection} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

DateRangePicker.propTypes = {
  style: PropTypes.shape({}),
  granularity: GRANULARITY_SHAPE,
  onSetDates: PropTypes.func,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
};

DateRangePicker.defaultProps = {
  style: {},
  granularity: DAY,
  onSetDates: () => {},
  isLoading: false,
};

const styles = {
  dialog: {
    zIndex: DIALOG_Z_INDEX + 1,
  },
  dialogContainer: {
    width: '75%',
    maxWidth: '700px',
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
  },
  dateRow: {
    display: 'flex',
    marginTop: 30,
  },
  button: {
    cursor: 'pointer',
    outline: 'none',
    border: 0,
    padding: 0,
    backgroundColor: 'transparent',
    display: 'flex',
    color: OFF_WHITE,
    paddingBottom: 5,
    paddingRight: 5,
  },
  buttonBorder: {
    borderBottom: `1px solid ${OFF_WHITE}`,
  },
  buttonIcon: {
    marginRight: 5,
    width: 15,
    height: 15,
    color: WHITE,
  },
  leftButton: {
    paddingRight: 10,
  },
  rightButton: {
    paddingLeft: 10,
  },
};
