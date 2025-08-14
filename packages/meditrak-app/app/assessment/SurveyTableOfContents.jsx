import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';

import {
  THEME_TEXT_COLOR_ONE,
  THEME_TEXT_COLOR_THREE,
  THEME_COLOR_TWO,
  DEFAULT_PADDING,
  THEME_COLOR_LIGHT,
} from '../globalStyles';
import { TouchableOpacity } from '../widgets';

export const SurveyTableOfContents = ({
  activeScreenIndex,
  onSelectScreen,
  screens,
  questions,
}) => (
  <View>
    {screens.map(({ screenNumber, components }, index) => (
      <TouchableOpacity
        analyticsLabel={`Table of Contents: ${screenNumber}`}
        key={screenNumber}
        style={styles.screenItem}
        onPress={() => onSelectScreen(index)}
      >
        <Text
          style={[styles.screenText, activeScreenIndex === index ? styles.screenTextActive : null]}
          numberOfLines={1}
        >
          <Text style={styles.screenTextBold}>{`Step ${screenNumber}`}</Text>
          {questions && components.length > 0
            ? `: ${questions[components[0].questionId].questionText}`
            : ''}
        </Text>
      </TouchableOpacity>
    ))}
    <TouchableOpacity
      onPress={() => onSelectScreen(screens.length)}
      analyticsLabel="Table of Contents: Submit survey"
    >
      <Text
        style={[
          styles.screenTextBold,
          styles.screenText,
          activeScreenIndex === screens.length ? styles.screenTextActive : null,
        ]}
      >
        Submit your survey
      </Text>
    </TouchableOpacity>
  </View>
);

SurveyTableOfContents.propTypes = {
  screens: PropTypes.array.isRequired,
  onSelectScreen: PropTypes.func.isRequired,
  activeScreenIndex: PropTypes.number,
  questions: PropTypes.shape({}).isRequired,
};

SurveyTableOfContents.defaultProps = {
  activeScreenIndex: 0,
};

const styles = StyleSheet.create({
  screenItem: {
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLOR_LIGHT,
  },
  screenText: {
    fontSize: 14,
    color: THEME_TEXT_COLOR_THREE,
    padding: DEFAULT_PADDING / 2,
  },
  screenTextBold: {
    fontWeight: 'bold',
  },
  screenTextActive: {
    backgroundColor: THEME_COLOR_TWO,
    color: THEME_TEXT_COLOR_ONE,
  },
});
