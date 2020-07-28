/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { PureComponent } from 'react';
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

export class DateRangePicker extends PureComponent {
  constructor(props) {
    super(props);
    this.minMomentDate = moment('20150101');
    this.maxMomentDate = moment();
    this.defaultStartDate = this.isSingleDate ? moment() : this.minMomentDate;
    this.defaultEndDate = this.isSingleDate ? this.defaultStartDate : this.maxMomentDate;
    this.isSingleDate = GRANULARITIES_WITH_ONE_DATE.includes(this.props.granularity);
    const { startDate, endDate } = this.getCurrentDates();
    this.state = {
      isOpen: false,
      selectedStartDate: startDate,
      selectedEndDate: endDate,
      errorMessage: '',
    };
    this.onSubmitDateSelection(true);
  }

  getCurrentDates() {
    const { startDate, endDate } = this.props;
    return {
      startDate: startDate ? moment(startDate) : this.defaultStartDate,
      endDate: endDate ? moment(endDate) : this.defaultEndDate,
    };
  }

  getBoundingDatesFromSelection() {
    const { granularity } = this.props;
    const { startDate: fallbackStartDate, endDate: fallbackEndDate } = this.getCurrentDates();

    const { selectedStartDate, selectedEndDate } = this.state;

    const endDate = selectedEndDate || fallbackEndDate;
    const startDate = this.isSingleDate ? endDate.clone() : selectedStartDate || fallbackStartDate;

    // Round dates to the unit of granularity
    return roundStartEndDates(granularity, startDate, endDate);
  }

  getDatesAsString() {
    const { granularity } = this.props;
    const { startDate, endDate } = this.getCurrentDates();

    if (!startDate || !endDate) {
      return getLabelText(granularity);
    }

    const { momentUnit, rangeFormat } = GRANULARITY_CONFIG[granularity] || DEFAULT_GRANULARITY;
    const formattedStartDate = startDate.format(rangeFormat);
    const formattedEndDate = endDate.startOf(momentUnit).format(rangeFormat);

    return this.isSingleDate ? formattedStartDate : `${formattedStartDate} - ${formattedEndDate}`;
  }

  // Number of periods to move may be negative if changing to the previous period
  changePeriod = numberOfPeriodsToMove => {
    if (!this.isSingleDate) {
      throw new Error('Can only change period for single unit date pickers (e.g. one month)');
    }
    const { granularity } = this.props;
    const { startDate, endDate } = this.getCurrentDates();

    const { momentShorthand } = GRANULARITY_CONFIG[granularity];
    this.setState(
      {
        selectedStartDate: startDate.clone().add(numberOfPeriodsToMove, momentShorthand),
        selectedEndDate: endDate.clone().add(numberOfPeriodsToMove, momentShorthand),
      },
      this.onSubmitDateSelection,
    );
  };

  onCancelDateSelection = () => {
    this.setState({ isOpen: false, errorMessage: '' });
    this.resetSelectedDates();
  };

  onSubmitDateSelection = (forceSetDates = false) => {
    const { onSetDates } = this.props;
    const { startDate, endDate } = this.getBoundingDatesFromSelection();

    if (startDate.isAfter(endDate)) {
      this.setState({
        errorMessage: 'Start date must be before end date',
      });
    } else {
      // Only update if the dates have actually changed by at least one day
      const { startDate: currentStartDate, endDate: currentEndDate } = this.getCurrentDates();
      if (
        forceSetDates ||
        !currentStartDate.isSame(startDate, 'day') ||
        !currentEndDate.isSame(endDate, 'day')
      ) {
        onSetDates(startDate, endDate);
      }
      // Close the dialog
      this.setState({ isOpen: false, errorMessage: '' });
    }
  };

  resetSelectedDates() {
    const { startDate: selectedStartDate, endDate: selectedEndDate } = this.getCurrentDates();
    this.setState({
      selectedStartDate,
      selectedEndDate,
    });
  }

  renderSelectedPeriodInfo() {
    const { isLoading, style } = this.props;
    const dateString = this.getDatesAsString();
    const buttonStyle = isLoading ? styles.button : { ...styles.button, ...styles.buttonBorder };
    return (
      <div style={{ ...styles.wrapper, ...style }}>
        {this.isSingleDate && (
          <button
            style={{ ...styles.button, ...styles.leftButton }}
            type="button"
            onClick={() => {
              this.changePeriod(-1);
            }}
            disabled={isLoading}
          >
            {'<'}
          </button>
        )}
        <button style={buttonStyle} type="button" onClick={() => this.setState({ isOpen: true })}>
          {isLoading ? (
            <CircularProgress style={styles.buttonIcon} size={15} thickness={2} />
          ) : (
            <DateRangeIcon style={styles.buttonIcon} />
          )}
          {dateString}
        </button>
        {this.isSingleDate && (
          <button
            style={{ ...styles.button, ...styles.rightButton }}
            type="button"
            onClick={() => {
              this.changePeriod(1);
            }}
            disabled={isLoading}
          >
            {'>'}
          </button>
        )}
      </div>
    );
  }

  renderDateRow(isEndDate = false) {
    const { minMomentDate, maxMomentDate, defaultStartDate, defaultEndDate } = this;
    const { selectedStartDate = defaultStartDate, selectedEndDate = defaultEndDate } = this.state;
    const { granularity } = this.props;
    const dateValue = isEndDate ? selectedEndDate : selectedStartDate;

    const stateKey = isEndDate ? 'selectedEndDate' : 'selectedStartDate';

    const pickerRowProps = {
      momentDateValue: dateValue,
      minMomentDate: minMomentDate,
      maxMomentDate: maxMomentDate,
      onChange: newDate => this.setState({ [stateKey]: newDate }),
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
  }

  render() {
    const { style, granularity } = this.props;
    const { errorMessage } = this.state;

    return (
      <div style={{ ...styles.wrapper, ...style }}>
        {this.renderSelectedPeriodInfo()}
        <Dialog
          modal="true"
          open={this.state.isOpen}
          style={styles.dialog}
          PaperProps={{ style: styles.dialogContainer }}
        >
          <DialogTitle>{getLabelText(granularity)}</DialogTitle>
          <DialogContent>
            {!this.isSingleDate && this.renderDateRow()}
            {this.renderDateRow(true)}
            {errorMessage ? <Error>{errorMessage}</Error> : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCancelDateSelection}>Cancel</Button>
            <Button color="primary" onClick={this.onSubmitDateSelection} variant="contained">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

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
