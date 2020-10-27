/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getSurveyScreenQuestions } from './selectors';
import { Question } from './Question';

const TABBABLE_QUESTION_TYPES = ['FreeText', 'Number'];

class DumbQuestionScreen extends React.Component {
  constructor(props) {
    super(props);

    this.textInputRefs = {};
  }

  shouldComponentUpdate(nextProps) {
    const currentQuestions = this.props.questions;
    const nextQuestions = nextProps.questions;
    const currentAnswers = JSON.stringify(this.props.answers);
    const nextAnswers = JSON.stringify(nextProps.answers);

    if (
      currentAnswers !== nextAnswers ||
      currentQuestions.length !== nextQuestions.length ||
      currentQuestions.some((question, index) => question.id !== nextQuestions[index].id)
    ) {
      return true;
    }
    return false;
  }

  render() {
    const { questions, answers, screenIndex, database } = this.props;
    return questions.map((question, index) => {
      const isVisible = question.checkVisibility(answers);
      if (!TABBABLE_QUESTION_TYPES.includes(question.type)) {
        return (
          <Question
            key={question.id}
            realmDatabase={database}
            screenIndex={screenIndex}
            isVisible={isVisible}
            {...question}
          />
        );
      }
      const nextQuestionIsTabbable =
        index + 1 < questions.length && TABBABLE_QUESTION_TYPES.includes(questions[index + 1].type);
      return (
        <Question
          key={question.id}
          realmDatabase={database}
          screenIndex={screenIndex}
          isVisible={isVisible}
          {...question}
          textInputProps={{
            inputRef: textInputRef => {
              this.textInputRefs[question.id] = textInputRef;
            },
            onSubmitEditing: () => {
              if (nextQuestionIsTabbable) {
                this.textInputRefs[questions[index + 1].id].focus();
              }
            },
            returnKeyType: nextQuestionIsTabbable ? 'next' : 'done',
          }}
        />
      );
    });
  }
}

DumbQuestionScreen.propTypes = {
  questions: PropTypes.array.isRequired,
  screenIndex: PropTypes.number.isRequired,
};

const mapStateToProps = (state, { screenIndex }) => ({
  answers: state.assessment.answers,
  questions: getSurveyScreenQuestions(state, screenIndex),
});

export const QuestionScreen = connect(mapStateToProps)(DumbQuestionScreen);
