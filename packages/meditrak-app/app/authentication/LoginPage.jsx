/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, StatusBar, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import {
  Button,
  StatusMessage,
  TupaiaLogo,
  TextInput,
  Text,
  TouchableOpacity,
  TupaiaBackground,
} from '../widgets';

import {
  DEFAULT_PADDING,
  THEME_FONT_FAMILY,
  THEME_COLOR_ONE,
  THEME_COLOR_DARK,
  THEME_FONT_SIZE_ONE,
} from '../globalStyles';

const renderCreateAccountLink = onCreateAccount => (
  <View style={localStyles.linkButton}>
    <Text>or </Text>
    <TouchableOpacity onPress={onCreateAccount} analyticsLabel="Login: Create an Account">
      <Text style={localStyles.linkButtonEmphasis}>Create an account</Text>
    </TouchableOpacity>
  </View>
);

const renderSubmitButton = (onLogin, isDisabled) => (
  <Button
    title="Log In"
    onPress={onLogin}
    isDisabled={isDisabled}
    style={localStyles.loginButton}
  />
);

const renderErrorMessage = message => (
  <StatusMessage message={message} style={localStyles.errorMessage} />
);

const renderLoadingSpinner = () => <ActivityIndicator color={THEME_COLOR_ONE} size="large" />;

/**
 * Displays a page with a field for each emailAddress, and password, and allows users to log in to a
 * country chosen from a drop down list
 */
export class LoginPage extends React.Component {
  render() {
    const {
      errorMessage,
      fieldsAreEditable,
      loginButtonIsEnabled,
      onChangePassword,
      onChangeEmailAddress,
      onCreateAccount,
      onLogin,
      password,
      emailAddress,
      isLoggingIn,
    } = this.props;

    return (
      <TupaiaBackground style={localStyles.container}>
        <KeyboardAvoidingView behavior="padding" style={localStyles.container}>
          <StatusBar barStyle="light-content" />
          <TupaiaLogo style={localStyles.logo} white width={168} height={69} />
          <Text style={localStyles.intro}>
            Collect baseline data from clinics, health centres and hospitals around the world.
          </Text>
          {errorMessage !== '' && renderErrorMessage(errorMessage)}
          <View style={localStyles.horizontalContainer}>
            <TextInput
              style={[localStyles.textInput, localStyles.text]}
              placeholder="Email Address"
              placeholderTextColor={THEME_COLOR_ONE}
              value={emailAddress}
              editable={fieldsAreEditable}
              returnKeyType="next"
              keyboardType="email-address"
              selectTextOnFocus
              onChangeText={onChangeEmailAddress}
              onSubmitEditing={() => {
                if (this.passwordInputRef) this.passwordInputRef.focus();
              }}
            />
          </View>
          <View style={localStyles.horizontalContainer}>
            <TextInput
              inputRef={reference => {
                this.passwordInputRef = reference;
              }}
              style={[localStyles.textInput, localStyles.text]}
              placeholder="Password"
              placeholderTextColor={THEME_COLOR_ONE}
              value={password}
              secureTextEntry
              editable={fieldsAreEditable}
              returnKeyType="done"
              selectTextOnFocus
              onChangeText={onChangePassword}
              onSubmitEditing={() => {
                if (this.passwordInputRef) this.passwordInputRef.blur();
                if (loginButtonIsEnabled) onLogin(emailAddress, password);
              }}
            />
          </View>
          <View style={localStyles.actions}>
            {isLoggingIn && renderLoadingSpinner()}
            {!isLoggingIn &&
              renderSubmitButton(() => onLogin(emailAddress, password), !loginButtonIsEnabled)}
            {!isLoggingIn && renderCreateAccountLink(onCreateAccount, isLoggingIn)}
          </View>
        </KeyboardAvoidingView>
      </TupaiaBackground>
    );
  }
}

LoginPage.propTypes = {
  errorMessage: PropTypes.string,
  fieldsAreEditable: PropTypes.bool,
  loginButtonIsEnabled: PropTypes.bool,
  onChangePassword: PropTypes.func.isRequired,
  onChangeEmailAddress: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
  onCreateAccount: PropTypes.func.isRequired,
  password: PropTypes.string,
  emailAddress: PropTypes.string,
  isLoggingIn: PropTypes.bool,
};

LoginPage.defaultProps = {
  errorMessage: '',
  fieldsAreEditable: true,
  loginButtonIsEnabled: true,
  password: '',
  emailAddress: '',
  isLoggingIn: false,
};

const HORIZONTAL_MARGIN = 20;
const localStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalContainer: {
    marginHorizontal: HORIZONTAL_MARGIN,
    height: 50,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: THEME_COLOR_ONE,
  },
  logo: {
    marginBottom: DEFAULT_PADDING,
  },
  intro: {
    marginBottom: 32,
    marginHorizontal: HORIZONTAL_MARGIN,
    textAlign: 'center',
    opacity: 0.9,
  },
  textInput: {
    flex: 1,
    padding: 0,
    paddingTop: 15,
  },
  actions: {
    marginTop: 40,
    width: '100%',
  },
  loginButton: {
    marginBottom: 10,
  },
  text: {
    color: THEME_COLOR_ONE,
    fontFamily: THEME_FONT_FAMILY,
    fontSize: THEME_FONT_SIZE_ONE,
  },
  textOption: {
    color: THEME_COLOR_DARK,
  },
  linkButton: {
    padding: 8,
    flexDirection: 'row',
  },
  linkButtonEmphasis: {
    textDecorationLine: 'underline',
  },
  errorMessage: {
    marginHorizontal: DEFAULT_PADDING,
    marginBottom: 0,
  },
});
