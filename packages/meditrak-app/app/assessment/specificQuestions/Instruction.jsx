/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';

import { getLineHeight, THEME_FONT_SIZE_ONE, THEME_FONT_SIZE_THREE } from '../../globalStyles';
import { Text } from '../../widgets';

const renderDetailText = detailText => (
  <Text style={[localStyles.text, localStyles.detailText]}>{detailText}</Text>
);

const renderQuestionText = (questionText, headerLevel) => (
  <Text
    style={[
      localStyles.text,
      headerLevel === HEADER_LEVELS.MAIN_HEADER ? localStyles.textMain : localStyles.textSub,
    ]}
  >
    {questionText}
  </Text>
);

export const Instruction = ({ questionText, detailText, headerLevel }) => {
  // Skip rendering of instruction if there is no text to render.
  if (!questionText && !detailText) {
    return null;
  }

  return (
    <View>
      {questionText && questionText.length > 0
        ? renderQuestionText(questionText, headerLevel)
        : null}
      {detailText && detailText.length > 0 ? renderDetailText(detailText) : null}
    </View>
  );
};

export const HEADER_LEVELS = {
  MAIN_HEADER: 'MAIN_HEADER',
  SUB_HEADER: 'SUB_HEADER',
};

Instruction.propTypes = {
  questionText: PropTypes.string,
  detailText: PropTypes.string,
  headerLevel: PropTypes.oneOf(Object.values(HEADER_LEVELS)),
};

Instruction.defaultProps = {
  questionText: '',
  detailText: '',
  headerLevel: HEADER_LEVELS.MAIN_HEADER,
};

const localStyles = StyleSheet.create({
  text: {
    marginVertical: 5,
  },
  textMain: {
    fontSize: THEME_FONT_SIZE_THREE,
    lineHeight: getLineHeight(THEME_FONT_SIZE_THREE),
    fontWeight: 'bold',
  },
  textSub: {
    fontSize: THEME_FONT_SIZE_ONE,
    lineHeight: getLineHeight(THEME_FONT_SIZE_ONE),
    fontWeight: 'bold',
  },
  detailText: {
    fontSize: THEME_FONT_SIZE_ONE,
    lineHeight: getLineHeight(THEME_FONT_SIZE_ONE, 1.2),
    marginTop: 0,
    flexGrow: 1,
    flex: 1,
    fontWeight: 'normal',
  },
});
