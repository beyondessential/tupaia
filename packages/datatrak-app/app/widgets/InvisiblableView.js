/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Animated, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';

export class InvisiblableView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      animatedOpacity: new Animated.Value(props.isInvisible ? 0 : 1),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isInvisible === nextProps.isInvisible) return;
    Animated.timing(this.state.animatedOpacity, {
      toValue: nextProps.isInvisible ? 0 : 1,
      duration: 300,
    }).start();
  }

  render() {
    return (
      <Animated.View
        style={{
          ...this.props.style,
          opacity: this.state.animatedOpacity,
        }}
      >
        {this.props.children}
      </Animated.View>
    );
  }
}

InvisiblableView.propTypes = {
  children: PropTypes.node,
  isInvisible: PropTypes.bool,
  style: ViewPropTypes.style,
};

InvisiblableView.defaultProps = {
  children: null,
  isInvisible: false,
  style: null,
};
