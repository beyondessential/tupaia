import React, { PureComponent } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import DatePicker from 'react-native-modal-datetime-picker';

import { Text, TouchableOpacity, Icon } from '../../widgets';
import { formatDate } from '../../utilities';
import {
  getThemeColorOneFaded,
  THEME_FONT_FAMILY,
  THEME_TEXT_COLOR_ONE,
  THEME_FONT_SIZE_ONE,
} from '../../globalStyles';

export class DateQuestion extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      isDatePickerOpen: false,
    };
  }

  onDateChange(date) {
    // set to closed before changing answer, per https://github.com/mmazzarolo/react-native-modal-datetime-picker#the-picker-shows-up-twice-on-android
    this.setState({ isDatePickerOpen: false }, () => {
      const { onChangeAnswer } = this.props;
      onChangeAnswer(formatDate(date));
    });
  }

  onOpenDatePicker() {
    this.setState({ isDatePickerOpen: true });
  }

  onCloseDatePicker() {
    this.setState({ isDatePickerOpen: false });
  }

  onClearDate() {
    Alert.alert(
      'Clear selected date',
      'Are you sure you want to remove the currently selected date for this question?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => this.props.onChangeAnswer(undefined) },
      ],
      { cancelable: true },
    );
  }

  renderLabel(answer) {
    return answer === '' ? 'Tap to select a date' : formatDate(answer, 'MMMM D, YYYY');
  }

  renderInput() {
    const { answer, renderLabel } = this.props;
    return (
      <Text style={localStyles.textInput}>
        {renderLabel ? renderLabel(answer) : this.renderLabel(answer)}
      </Text>
    );
  }

  render() {
    const { answer, datePickerMode, questionText, maximumDate } = this.props;
    const hasAnswer = answer === 0 || !!answer;

    return (
      <View style={localStyles.wrapper}>
        <TouchableOpacity
          analyticsLabel={`Date: ${questionText}`}
          style={localStyles.field}
          onPress={() => this.onOpenDatePicker()}
        >
          <Icon library="Ionic" name="calendar-outline" size={20} style={localStyles.icon} />
          {this.renderInput()}
        </TouchableOpacity>
        {hasAnswer && (
          <TouchableOpacity
            analyticsLabel="Date: Clear"
            style={localStyles.removeButton}
            onPress={() => this.onClearDate()}
          >
            <Icon library="Material" name="close" size={14} />
          </TouchableOpacity>
        )}
        <DatePicker
          isVisible={this.state.isDatePickerOpen}
          onConfirm={date => this.onDateChange(date)}
          onCancel={() => this.onCloseDatePicker()}
          date={hasAnswer ? new Date(answer) : new Date()}
          maximumDate={maximumDate}
          mode={datePickerMode}
        />
      </View>
    );
  }
}

DateQuestion.propTypes = {
  answer: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  datePickerMode: PropTypes.oneOf(['date', 'time', 'datetime']),
  onChangeAnswer: PropTypes.func.isRequired,
  questionText: PropTypes.string,
  maximumDate: PropTypes.instanceOf(Date),
};

DateQuestion.defaultProps = {
  answer: '',
  datePickerMode: 'date',
  questionText: null,
  maximumDate: undefined,
};

const localStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: getThemeColorOneFaded(0.2),
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    color: THEME_TEXT_COLOR_ONE,
    fontFamily: THEME_FONT_FAMILY,
    fontSize: THEME_FONT_SIZE_ONE,
    paddingVertical: 10,
    height: 40,
  },
  icon: {
    marginRight: 10,
  },
  removeButton: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export class DateTimeQuestion extends PureComponent {
  render() {
    return <DateQuestion datePickerMode="datetime" {...this.props} />;
  }
}
