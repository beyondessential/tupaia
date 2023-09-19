/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { DateQuestion } from './DateQuestion';
import { formatPlural } from '../../utilities';

class TimeSinceQuestion extends PureComponent {
  render() {
    const { answer = {}, unitOfTime, onChangeAnswer, ...restOfProps } = this.props;
    const { raw: rawAnswer, processed: processedAnswer } = answer;
    return (
      <DateQuestion
        answer={rawAnswer}
        onChangeAnswer={answer => {
          const numberOfUnitsSince = moment().diff(answer, unitOfTime).toString(); // Convert to number of days, months, or years
          onChangeAnswer({
            raw: answer, // Save the raw date answer to maintain an accurate answer to work off while the survey is in progress
            processed: numberOfUnitsSince, // Answers with a 'processed' key will have that processed value saved in the database
          });
        }}
        renderLabel={() =>
          processedAnswer === undefined
            ? 'Tap to set the date to measure from'
            : `${processedAnswer} ${formatPlural(
                unitOfTime.substring(0, unitOfTime.length - 1),
                unitOfTime,
                processedAnswer,
              )}`
        }
        maximumDate={moment().toDate()}
        {...restOfProps}
      />
    );
  }
}

TimeSinceQuestion.propTypes = {
  onChangeAnswer: PropTypes.func.isRequired,
  unitOfTime: PropTypes.string.isRequired,
};
export const DaysSinceQuestion = props => <TimeSinceQuestion unitOfTime="days" {...props} />;
export const MonthsSinceQuestion = props => <TimeSinceQuestion unitOfTime="months" {...props} />;
export const YearsSinceQuestion = props => <TimeSinceQuestion unitOfTime="years" {...props} />;
