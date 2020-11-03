/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React, { PureComponent } from 'react';
import { Animated, StyleSheet, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';
import Svg, { Path } from 'react-native-svg';
import { PIG_PINK } from '../globalStyles';

const ANIMATION_LOOP_DELAY = 4000;

export class Pig extends PureComponent {
  constructor(props) {
    super(props);

    this.animation = new Animated.Value(0);
  }

  componentDidMount() {
    this.playAnimation();
  }

  getAnimationStyle() {
    return {
      transform: [
        {
          rotate: this.animation.interpolate({
            inputRange: [0, 20, 40, 60, 80, 100],
            outputRange: ['0deg', '10deg', '-10deg', '10deg', '-10deg', '0deg'],
          }),
        },
      ],
    };
  }

  playAnimation() {
    this.animation.setValue(0);

    Animated.timing(this.animation, {
      toValue: 100,
      duration: 1000,
      delay: 1000,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        this.playAnimation();
      }, ANIMATION_LOOP_DELAY);
    });
  }

  render() {
    const { style, size, color } = this.props;

    return (
      <Animated.View style={[localStyles.container, this.getAnimationStyle(), style]}>
        <Svg viewBox="-0.903 -6.719 90 90" width={size} height={size}>
          <Path
            fill={color}
            d="M75.633,17.693c4.664,6.423,7.423,14.319,7.423,22.865c0,21.516-17.441,38.959-38.957,38.959  S5.142,62.074,5.142,40.559c0-8.546,2.758-16.442,7.423-22.865C7.017,19.548,4.42,12.489,1.175,5.808c-3.341-6.879,0,0,15.823-4.521  c9.687-2.768,14.654-0.526,17.053,1.629c3.207-0.854,6.573-1.315,10.048-1.315s6.842,0.461,10.048,1.315  c2.399-2.155,7.367-4.396,17.055-1.629c15.82,4.521,19.162-2.358,15.82,4.521C83.778,12.489,81.18,19.548,75.633,17.693z   M44.098,38.754c-10.618,0-19.227,7.271-19.227,16.237c0,8.969,8.608,16.242,19.227,16.242s19.227-7.273,19.227-16.242  C63.325,46.024,54.716,38.754,44.098,38.754z M58.472,15.937c-5.229,0-9.469,4.24-9.469,9.469c0,5.23,4.239,9.469,9.469,9.469  s9.469-4.239,9.469-9.469C67.941,20.177,63.702,15.937,58.472,15.937z M29.827,16.09c-5.229,0-9.469,4.241-9.469,9.471  c0,5.229,4.239,9.469,9.469,9.469c5.23,0,9.47-4.239,9.47-9.469C39.296,20.331,35.057,16.09,29.827,16.09z M50.432,49.162  c-2.188,0-3.961,2.611-3.961,5.832c0,3.219,1.772,5.831,3.961,5.831c2.188,0,3.961-2.612,3.961-5.831  C54.393,51.773,52.62,49.162,50.432,49.162z M37.777,49.176c-2.188,0-3.961,2.611-3.961,5.832c0,3.219,1.773,5.831,3.961,5.831  c2.188,0,3.961-2.612,3.961-5.831C41.739,51.787,39.965,49.176,37.777,49.176z M32.131,25.561c-1.425,0-2.58,1.155-2.58,2.58  c0,1.424,1.155,2.579,2.58,2.579c1.424,0,2.579-1.155,2.579-2.579C34.71,26.715,33.555,25.561,32.131,25.561z M56.176,25.358  c-1.424,0-2.58,1.155-2.58,2.58s1.156,2.579,2.58,2.579c1.425,0,2.579-1.154,2.579-2.579S57.601,25.358,56.176,25.358z"
          />
        </Svg>
      </Animated.View>
    );
  }
}

Pig.propTypes = {
  style: ViewPropTypes.style,
  size: PropTypes.number,
  color: PropTypes.string,
};

Pig.defaultProps = {
  size: 100,
  style: null,
  color: PIG_PINK,
};

const localStyles = StyleSheet.create({
  container: { alignSelf: 'center' },
});
