import React from 'react';
import { connect } from 'react-redux';
import { Image, Platform } from 'react-native';
import { HeaderBackButton } from 'react-navigation-stack';
import { goBack } from './actions';
import { THEME_COLOR_THREE } from '../globalStyles';

// On iOS the tintColor prop on Image doesn't work, and the left margin is off
const iosStyle = { marginLeft: 10, tintColor: THEME_COLOR_THREE };

export const HeaderLeftButtonContainer = ({ source, ...props }) => (
  <HeaderBackButton
    {...props}
    tintColor={THEME_COLOR_THREE}
    backImage={
      source
        ? () => (
            <Image
              source={source}
              style={Platform.OS === 'ios' ? iosStyle : {}}
              tintColor={THEME_COLOR_THREE}
            />
          )
        : null
    }
  />
);

const mapDispatchToProps = dispatch => ({
  onPress: () => dispatch(goBack()),
});

export const HeaderLeftButton = connect(null, mapDispatchToProps)(HeaderLeftButtonContainer);
