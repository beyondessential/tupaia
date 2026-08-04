import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { Text, StatusMessage, STATUS_MESSAGE_ERROR } from '../../widgets';
import { generateShortId, generateMongoId, SHORT_ID } from '../../utilities';
import { getLineHeight, THEME_FONT_SIZE_ONE, THEME_TEXT_COLOR_FOUR } from '../../globalStyles';
import { getAnswerForQuestion, getQuestion } from '../selectors';

export class CodeGeneratorQuestionComponent extends PureComponent {
  componentDidMount() {
    const { answer, config, onChangeAnswer } = this.props;
    // Dynamic-prefix codes are generated reactively by DynamicCodeGeneratorWatcher, not here.
    if (config.codeGenerator.dynamicPrefix) return;
    if (!answer) {
      onChangeAnswer(this.generateCode());
    }
  }

  generateCode() {
    const { config } = this.props;
    return config.codeGenerator.type === SHORT_ID ? generateShortId(config) : generateMongoId();
  }

  render() {
    const { answer, helperText, isWarning } = this.props;

    if (answer) {
      return (
        <View>
          <Text style={localStyles.text}>{answer}</Text>
        </View>
      );
    }

    if (helperText && isWarning) {
      return (
        <View>
          <StatusMessage type={STATUS_MESSAGE_ERROR} message={helperText} />
        </View>
      );
    }

    return (
      <View>{helperText ? <Text style={localStyles.helperText}>{helperText}</Text> : null}</View>
    );
  }
}

CodeGeneratorQuestionComponent.propTypes = {
  answer: PropTypes.string,
  onChangeAnswer: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  helperText: PropTypes.string,
  isWarning: PropTypes.bool,
};

CodeGeneratorQuestionComponent.defaultProps = {
  answer: null,
  helperText: null,
  isWarning: false,
};

// Provide helper/warning text for dynamic-prefix questions when no code has been generated yet.
const mapStateToProps = (state, { id: questionId, config, answer }) => {
  const dynamicPrefix = config.codeGenerator && config.codeGenerator.dynamicPrefix;
  if (!dynamicPrefix || answer) return {};

  const sourceQuestion = getQuestion(state, dynamicPrefix.questionId);
  const questionLabel = (sourceQuestion && sourceQuestion.questionText) || 'the prerequisite';

  if (!getAnswerForQuestion(state, dynamicPrefix.questionId)) {
    return { helperText: `Answer "${questionLabel}" to generate a code`, isWarning: false };
  }

  return {
    helperText: `Could not generate a code. The selected answer to "${questionLabel}" is missing a required attribute.`,
    isWarning: true,
  };
};

export const CodeGeneratorQuestion = connect(mapStateToProps)(CodeGeneratorQuestionComponent);

const localStyles = StyleSheet.create({
  text: {
    fontSize: THEME_FONT_SIZE_ONE,
    lineHeight: getLineHeight(THEME_FONT_SIZE_ONE, 1.2),
    fontWeight: '500',
  },
  helperText: {
    fontSize: THEME_FONT_SIZE_ONE,
    lineHeight: getLineHeight(THEME_FONT_SIZE_ONE, 1.2),
    color: THEME_TEXT_COLOR_FOUR,
  },
});
