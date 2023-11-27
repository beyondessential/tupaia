/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Animated, Easing, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';

export const SPIN = 'SPIN';

export class AnimatedView extends React.Component {
  constructor(props) {
    super(props);

    this.state = { animationValue: new Animated.Value(0) };
  }

  componentDidMount() {
    this.animation = Animated.loop(
      Animated.timing(this.state.animationValue, {
        toValue: 100,
        duration: this.props.duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    this.updateAnimation();
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.shouldAnimate !== this.props.shouldAnimate;
  }

  componentDidUpdate() {
    this.updateAnimation();
  }

  getAnimationStyle() {
    let animationStyle = {};

    switch (this.props.animationType) {
      case SPIN:
      default: {
        const interpolatedRotateAnimation = this.state.animationValue.interpolate({
          inputRange: [0, 100],
          outputRange: ['0deg', '180deg'],
        });

        animationStyle = { transform: [{ rotate: interpolatedRotateAnimation }] };
      }
    }

    return animationStyle;
  }

  updateAnimation() {
    if (this.props.shouldAnimate) {
      this.startAnimation();
    } else {
      this.stopAnimation();
    }
  }

  stopAnimation() {
    if (this.animation) {
      this.animation.stop();
      this.state.animationValue.setValue(0);
    }
  }

  startAnimation() {
    this.animation.start();
  }

  render() {
    return (
      <Animated.View style={[this.props.style, this.getAnimationStyle()]}>
        {this.props.children}
      </Animated.View>
    );
  }
}

AnimatedView.propTypes = {
  animationType: PropTypes.oneOf([SPIN]),
  children: PropTypes.node,
  duration: PropTypes.number,
  shouldAnimate: PropTypes.bool,
  style: ViewPropTypes.style,
};

AnimatedView.defaultProps = {
  animationType: SPIN,
  children: null,
  duration: 1000,
  isInvisible: false,
  shouldAnimate: true,
  style: null,
};
