/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import { getImageSourceFromData } from '../utilities';
import { DEFAULT_PADDING } from '../globalStyles';
import { Instruction, HEADER_LEVELS } from './specificQuestions/Instruction';
import { StatusMessage, STATUS_MESSAGE_ERROR } from '../widgets';

export class DumbQuestion extends React.Component {
  shouldComponentUpdate(nextProps) {
    if (
      this.props.answer === nextProps.answer &&
      this.props.validationErrorMessage === nextProps.validationErrorMessage &&
      this.props.isVisible === nextProps.isVisible
    ) {
      return false;
    }
    return true;
  }

  render() {
    const {
      imageData,
      text,
      SpecificQuestion,
      validationErrorMessage,
      ...questionProps
    } = this.props;
    return (
      <View
        style={{
          ...localStyles.container,
          display: questionProps.isVisible ? 'flex' : 'none',
        }}
      >
        {imageData && imageData.length > 0 ? (
          <Image source={getImageSourceFromData(imageData)} style={localStyles.image} />
        ) : null}
        {text && (
          <Instruction
            questionText={text}
            detailText={questionProps.detailText}
            headerLevel={HEADER_LEVELS.SUB_HEADER}
          />
        )}
        <SpecificQuestion key={questionProps.id} {...questionProps} />
        {validationErrorMessage && (
          <StatusMessage type={STATUS_MESSAGE_ERROR} message={validationErrorMessage} />
        )}
      </View>
    );
  }
}

DumbQuestion.propTypes = {
  detailText: PropTypes.string,
  imageData: PropTypes.string,
  text: PropTypes.string,
  validationErrorMessage: PropTypes.string,
  SpecificQuestion: PropTypes.any.isRequired,
};

DumbQuestion.defaultProps = {
  detailText: null,
  imageData: null,
  text: null,
  validationErrorMessage: null,
};

const IMAGE_WIDTH = (Dimensions.get('window').width - 40) / 2;
const localStyles = StyleSheet.create({
  container: {
    marginVertical: 5,
    marginBottom: DEFAULT_PADDING,
  },
  image: {
    width: IMAGE_WIDTH,
    height: IMAGE_WIDTH,
    alignSelf: 'center',
    margin: 10,
  },
});
