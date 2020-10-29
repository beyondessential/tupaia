/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Animated, Text, StyleSheet, Platform } from 'react-native';

import { THEME_COLOR_TWO, THEME_TEXT_COLOR_ONE, THEME_COLOR_SIX } from '../../globalStyles';
import { TouchableOpacity } from '../../widgets';

const BANNER_HEIGHT = 45;

export class MessageBanner extends PureComponent {
  constructor(props) {
    super(props);

    this.messageAnimation = new Animated.Value(0);
  }

  componentDidMount() {
    this.animateMessage();
  }

  animateMessage() {
    const { onDismiss, message } = this.props;

    // Show for a duration based on how long the message is so
    // that the user can read the message (min 2 seconds).
    const delayDuration = Math.max(message.length * 200, 3000);
    const slideDuration = 200;

    Animated.sequence([
      Animated.timing(this.messageAnimation, {
        duration: slideDuration,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.delay(delayDuration),
      Animated.timing(this.messageAnimation, {
        duration: slideDuration,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start(onDismiss);
  }

  render() {
    const { message, onDismiss } = this.props;

    const interpolatedTranslate = this.messageAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-BANNER_HEIGHT, 0],
    });

    return (
      <Animated.View
        style={[
          localStyles.wrapper,
          {
            transform: [
              {
                translateY: interpolatedTranslate,
              },
            ],
            opacity: this.messageAnimation,
          },
        ]}
      >
        <TouchableOpacity
          analyticsLabel="Message Banner"
          style={localStyles.message}
          onPress={onDismiss}
        >
          <Text style={localStyles.messageText}>{message}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }
}

MessageBanner.propTypes = {
  message: PropTypes.string.isRequired,
  onDismiss: PropTypes.func.isRequired,
};

MessageBanner.defaultProps = {
  messageOptions: {},
};

const bannerPaddingTop = Platform.OS === 'ios' ? 20 : 0;

const localStyles = StyleSheet.create({
  wrapper: {
    paddingTop: bannerPaddingTop, // Compensate for iOS status bar
    alignSelf: 'flex-start',
    width: '100%',
    height: BANNER_HEIGHT + bannerPaddingTop,
    backgroundColor: THEME_COLOR_TWO,
    // Set default translate for animation to override.
    transform: [{ translateY: -BANNER_HEIGHT }],
    opacity: 0,
    elevation: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: THEME_COLOR_SIX,
    shadowOpacity: 0.3,
  },
  message: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  messageText: {
    color: THEME_TEXT_COLOR_ONE,
    textAlign: 'center',
    fontSize: 12,
    paddingHorizontal: 20,
  },
});
