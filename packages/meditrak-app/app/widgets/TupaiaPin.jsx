/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { View, StyleSheet, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';
import Svg, { G, Path } from 'react-native-svg';

export const TupaiaPin = ({ style, height, width }) => (
  <View style={[localStyles.container, style]}>
    <Svg viewBox="17 10 111 159" width={width} height={height}>
      <G>
        <G>
          <Path
            fill="#ec632d"
            d="M72.499,119.934 C102.978,119.934,127.685,95.4688,127.685,65.2908 C127.685,35.1128,102.978,10.6478,72.499,10.6478 C42.019,10.6478,17.311,35.1128,17.311,65.2908 C17.312,95.4688,42.019,119.934,72.499,119.934"
          />
          <Path
            fill="#ec632d"
            d="M66.812,163.538 C66.812,163.538,72.513,174.618,78.216,163.538 L126.222,70.2568 C126.222,70.2568,131.923,59.1758,119.462,59.1758 L25.563,59.1758 C25.563,59.1758,13.102,59.1758,18.805,70.2568 L66.812,163.538 Z"
          />
          <Path
            fill="#fff"
            d="M72.499,105.202 C94.759,105.202,112.804,87.3328,112.804,65.2918 C112.804,43.2508,94.759,25.3838,72.499,25.3838 C50.237,25.3838,32.192,43.2508,32.192,65.2918 C32.192,87.3318,50.237,105.202,72.499,105.202"
          />
        </G>
        <Path
          fill="#007dc2"
          d="M68.522,61.4368 L53.114,61.4368 L53.114,69.1458 L68.522,69.1458 L68.614,84.2968 L76.702,84.2968 L76.608,69.1458 L92.017,69.1458 L92.017,61.4368 L76.608,61.4368 L76.608,46.2858 L68.481,46.2858 Z"
        />
        <Path
          fill="none"
          stroke="#007dc2"
          strokeWidth="10.476"
          d="M68.522,61.4368 L53.114,61.4368 L53.114,69.1458 L68.522,69.1458 L68.614,84.2968 L76.702,84.2968 L76.608,69.1458 L92.017,69.1458 L92.017,61.4368 L76.608,61.4368 L76.608,46.2858 L68.481,46.2858 Z"
        />
      </G>
    </Svg>
  </View>
);

TupaiaPin.propTypes = {
  style: ViewPropTypes.style,
  height: PropTypes.number,
  width: PropTypes.number,
};

TupaiaPin.defaultProps = {
  height: 100,
  width: 100,
  style: null,
};

const localStyles = StyleSheet.create({
  container: { alignSelf: 'center' },
});
