import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { Text } from '../../widgets';
import { calculateArithmetic } from '../../calculation/actions';
import { getQuestion } from '../selectors';

export class CalculatedQuestionComponent extends PureComponent {
  componentDidMount() {
    const { answer, onChangeAnswer, calculatedResult } = this.props;
    if (!answer) {
      onChangeAnswer(calculatedResult);
    }
  }

  render() {
    const { translatedFormula, calculatedResult } = this.props;
    return (
      <View>
        <Text>{translatedFormula}</Text>
        <Text>{calculatedResult}</Text>
      </View>
    );
  }
}

export const CalculatedQuestion = connect(
  (state, { id: questionId }) => {
    const { translatedFormula = '', calculatedResult = '' } = getQuestion(state, questionId);

    return {
      translatedFormula,
      calculatedResult,
    };
  },
  (dispatch, { id: questionId, onChangeAnswer }) => ({
    onMount: () => dispatch(calculateArithmetic(false, questionId)),
    onChangeAnswer,
  }),
)(CalculatedQuestionComponent);

CalculatedQuestionComponent.propTypes = {
  translatedFormula: PropTypes.string,
  onChangeAnswer: PropTypes.func.isRequired,
  calculatedResult: PropTypes.number,
};
