import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../widgets';
import { getLineHeight, THEME_FONT_SIZE_ONE } from '../../globalStyles';
import { getCalculatedResult } from '../selectors';

export class CalculatedQuestionComponent extends PureComponent {
  componentDidMount() {
    this.updateAnswer(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.updateAnswer(nextProps);
  }

  updateAnswer(props) {
    const { answer, onChangeAnswer, calculatedResult } = props;
    if (answer !== calculatedResult) {
      onChangeAnswer(calculatedResult);
    }
  }

  render() {
    const { translatedText, answer } = this.props;
    return (
      <View>
        <Text style={localStyles.text}>{translatedText || answer}</Text>
      </View>
    );
  }
}

export const CalculatedQuestion = connect((state, { id: questionId }) => {
  const { translatedText = '', calculatedResult = 0 } = getCalculatedResult(state, questionId);

  return {
    translatedText,
    calculatedResult,
  };
})(CalculatedQuestionComponent);

CalculatedQuestionComponent.propTypes = {
  translatedText: PropTypes.string,
  onChangeAnswer: PropTypes.func.isRequired,
  answer: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

CalculatedQuestionComponent.defaultProps = {
  translatedText: '',
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
