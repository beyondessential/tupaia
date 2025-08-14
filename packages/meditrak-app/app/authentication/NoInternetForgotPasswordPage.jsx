import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { Button, Text, TupaiaBackground, TupaiaLogo } from '../widgets';

export const NoInternetForgotPasswordPage = ({ onBackToLogin }) => (
  <TupaiaBackground style={localStyles.container}>
    <StatusBar barStyle="light-content" />
    <TupaiaLogo white width={168} height={69} />
    <Text style={localStyles.notice}>
      You are not connected to the internet. Please connect to the internet to reset your password
    </Text>
    <Button title="Back to login" onPress={onBackToLogin} />
  </TupaiaBackground>
);

const localStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 64,
    justifyContent: 'center',
    width: '100%',
  },
  notice: {
    marginHorizontal: 20,
    textAlign: 'center',
  },
});
