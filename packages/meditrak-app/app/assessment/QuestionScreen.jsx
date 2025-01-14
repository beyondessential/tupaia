import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Dimensions, ScrollView, View } from 'react-native';

import { getSurveyScreenQuestions } from './selectors';
import { releaseScrollControl } from './actions';
import { Question } from './Question';

const TABBABLE_QUESTION_TYPES = ['FreeText', 'Number'];

class DumbQuestionScreen extends React.Component {
  constructor(props) {
    super(props);

    this.textInputRefs = {};
    this.questionLayouts = {};

    this.state = {
      focusedQuestionId: null,
    };
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

    if (this.props.isChildScrolling !== nextProps.isChildScrolling) return true;

    return false;
  }

  componentWillUnmount() {
    this.props.releaseScrollControl();
  }

  scrollTo = questionId => {
    const layout = this.questionLayouts[questionId];
    if (!layout) {
      return;
    }
    this.scrollViewRef.scrollTo({ y: layout.y });
  };

  renderQuestions(questions) {
    const { answers, screenIndex, database } = this.props;
    const isOnlyQuestionOnScreen = questions.length === 1;
    return questions.map((question, index) => {
      const isVisible = question.checkVisibility(answers);
      if (!TABBABLE_QUESTION_TYPES.includes(question.type)) {
        return (
          <Question
            key={question.id}
            realmDatabase={database}
            screenIndex={screenIndex}
            isVisible={isVisible}
            isOnlyQuestionOnScreen={isOnlyQuestionOnScreen}
            onLayout={event => {
              this.questionLayouts[question.id] = event.nativeEvent.layout;
            }}
            scrollIntoFocus={() => this.scrollTo(question.id)}
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
          isOnlyQuestionOnScreen={isOnlyQuestionOnScreen}
          onLayout={event => {
            this.questionLayouts[question.id] = event.nativeEvent.layout;
          }}
          scrollIntoFocus={() => this.scrollTo(question.id)}
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

  render() {
    return (
      <ScrollView
        ref={scrollViewRef => {
          this.scrollViewRef = scrollViewRef;
        }}
        style={localStyles.scrollView}
        scrollEnabled={!this.props.isChildScrolling}
        nestedScrollEnabled
      >
        {this.renderQuestions(this.props.questions)}
        <View style={localStyles.endPadding} />
      </ScrollView>
    );
  }
}

DumbQuestionScreen.propTypes = {
  answers: PropTypes.object.isRequired,
  database: PropTypes.object.isRequired,
  questions: PropTypes.array.isRequired,
  screenIndex: PropTypes.number.isRequired,
  isChildScrolling: PropTypes.bool.isRequired,
  releaseScrollControl: PropTypes.func.isRequired,
};

const localStyles = {
  scrollView: {
    flex: 1,
    padding: 15,
  },
  endPadding: {
    height: Dimensions.get('window').height / 2,
  },
};

const mapStateToProps = (state, { screenIndex }) => ({
  answers: state.assessment.answers,
  questions: getSurveyScreenQuestions(state, screenIndex),
  isChildScrolling: state.assessment.isChildScrolling,
});

const mapDispatchToProps = dispatch => ({
  releaseScrollControl: () => dispatch(releaseScrollControl()),
});

export const QuestionScreen = connect(mapStateToProps, mapDispatchToProps)(DumbQuestionScreen);
