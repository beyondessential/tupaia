/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { connect } from 'react-redux';
import { HeaderBackButton } from 'react-navigation';
import { goBack } from './actions';

export const HeaderLeftButtonContainer = props => <HeaderBackButton {...props} />;

const mapDispatchToProps = dispatch => ({
  onPress: () => dispatch(goBack()),
});

export const HeaderLeftButton = connect(null, mapDispatchToProps)(HeaderLeftButtonContainer);
