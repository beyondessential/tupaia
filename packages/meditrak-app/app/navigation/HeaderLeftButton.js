/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { connect } from 'react-redux';
import { Image } from 'react-native';
import { HeaderBackButton } from 'react-navigation-stack';
import { goBack } from './actions';
import { THEME_COLOR_THREE } from '../globalStyles';

export const HeaderLeftButtonContainer = ({ source, ...props }) => (
  <HeaderBackButton
    {...props}
    tintColor={THEME_COLOR_THREE}
    backImage={source ? () => <Image source={source} tintColor={THEME_COLOR_THREE}></Image> : null}
  ></HeaderBackButton>
);

const mapDispatchToProps = dispatch => ({
  onPress: () => dispatch(goBack()),
});

export const HeaderLeftButton = connect(null, mapDispatchToProps)(HeaderLeftButtonContainer);
