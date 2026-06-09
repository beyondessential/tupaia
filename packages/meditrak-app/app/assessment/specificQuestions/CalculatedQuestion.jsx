import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../widgets';
import { getLineHeight, THEME_FONT_SIZE_ONE } from '../../globalStyles';
import { getArithmeticResult, getConditionResult } from '../selectors';

class CalculatedQuestionComponent extends PureComponent {
  componentDidMount() {
    this.updateAnswer(this.props);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.updateAnswer(nextProps);
  }

  updateAnswer(props) {
    const { answer, onChangeAnswer, result } = props;
    if (answer !== result) {
      onChangeAnswer(result);
    }
  }

  render() {
    const { answerDisplayText, answer } = this.props;
    return (
      <View>
        <Text style={localStyles.text}>{answerDisplayText || answer}</Text>
      </View>
    );
  }
}

export const ArithmeticQuestion = connect((state, { id: questionId }) => {
  const { answerDisplayText = '', result = 0 } = getArithmeticResult(state, questionId);

  return {
    answerDisplayText,
    result,
  };
})(CalculatedQuestionComponent);

export const ConditionQuestion = connect((state, { id: questionId }) => {
  const { answerDisplayText = '', result = 0 } = getConditionResult(state, questionId);

  return {
    answerDisplayText,
    result,
  };
})(CalculatedQuestionComponent);

CalculatedQuestionComponent.propTypes = {
  answerDisplayText: PropTypes.string,
  onChangeAnswer: PropTypes.func.isRequired,
  answer: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

CalculatedQuestionComponent.defaultProps = {
  answerDisplayText: '',
};

const localStyles = StyleSheet.create({
  text: {
    fontSize: THEME_FONT_SIZE_ONE,
    lineHeight: getLineHeight(THEME_FONT_SIZE_ONE, 1.2),
    marginTop: 0,
    flexGrow: 1,
    flex: 1,
    fontWeight: 'normal',
  },
});
