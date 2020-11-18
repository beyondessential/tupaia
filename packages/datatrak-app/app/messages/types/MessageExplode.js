import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Animated, Text, StyleSheet } from 'react-native';

import { Coconut, Pig, TouchableOpacity } from '../../widgets';
import {
  THEME_COLOR_ONE,
  THEME_COLOR_TWO,
  THEME_TEXT_COLOR_ONE,
  DEFAULT_PADDING,
  THEME_COLOR_SIX,
} from '../../globalStyles';

const renderSvg = svgName => {
  switch (svgName) {
    case 'coconut':
      return <Coconut color={THEME_COLOR_ONE} />;
    case 'pig':
      return <Pig color={THEME_COLOR_ONE} />;
    default:
      return null;
  }
};

export class MessageExplode extends PureComponent {
  constructor(props) {
    super(props);

    this.messageAnimation = new Animated.Value(0);
  }

  componentDidMount() {
    this.animateMessage();
  }

  animateMessage() {
    const { onDismiss } = this.props;

    Animated.timing(this.messageAnimation, {
      duration: 2500,
      toValue: 100,
      useNativeDriver: true,
    }).start(onDismiss);
  }

  render() {
    const { message, messageOptions, onDismiss } = this.props;
    const { title, svgName } = messageOptions;

    const interpolatedScale = this.messageAnimation.interpolate({
      inputRange: [0, 5, 8, 10, 90, 93, 100],
      outputRange: [0, 1, 1.1, 1, 1, 1.1, 0],
    });

    const interpolatedOpacity = this.messageAnimation.interpolate({
      inputRange: [0, 10, 90, 100],
      outputRange: [0, 1, 1, 0],
    });

    return (
      <Animated.View
        style={[
          localStyles.wrapper,
          {
            transform: [
              {
                scaleX: interpolatedScale,
              },
              {
                scaleY: interpolatedScale,
              },
            ],
            opacity: interpolatedOpacity,
          },
        ]}
      >
        <TouchableOpacity
          analyticsLabel="Message Explode"
          style={localStyles.message}
          onPress={onDismiss}
        >
          {svgName ? renderSvg(svgName) : null}
          {title ? (
            <Text style={[localStyles.messageText, localStyles.messageTitleText]}>{title}</Text>
          ) : null}
          <Text style={localStyles.messageText}>{message}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }
}

MessageExplode.propTypes = {
  message: PropTypes.string.isRequired,
  messageOptions: PropTypes.shape({
    title: PropTypes.string,
    svgName: PropTypes.string,
  }),
  onDismiss: PropTypes.func.isRequired,
};

MessageExplode.defaultProps = {
  messageOptions: {},
};

const MESSAGE_SIZE = 300;

const localStyles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
    // Set default scale and opacity to 0 for animation to override.
    opacity: 0,
    transform: [{ scaleX: 0 }, { scaleY: 0 }],
  },
  message: {
    borderRadius: MESSAGE_SIZE / 2,
    width: MESSAGE_SIZE,
    height: MESSAGE_SIZE,
    borderWidth: 4,
    borderColor: THEME_COLOR_ONE,
    backgroundColor: THEME_COLOR_TWO,
    padding: DEFAULT_PADDING,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: THEME_COLOR_SIX,
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  messageText: {
    color: THEME_TEXT_COLOR_ONE,
    textAlign: 'center',
    fontSize: 20,
    paddingHorizontal: 20,
  },
  messageTitleText: {
    fontWeight: 'bold',
  },
});
