import React, { PureComponent } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { MenuContext } from 'react-native-menu';
import { Form, Button, StatusMessage, STATUS_MESSAGE_ERROR, TupaiaBackground } from '../widgets';
import { getThemeColorOneFaded, DEFAULT_PADDING } from '../globalStyles';

const renderLoadingOverlay = () => (
  <View style={localStyles.loadingOverlay}>
    <ActivityIndicator size="large" />
  </View>
);

const renderErrorMessage = messageText => (
  <StatusMessage type={STATUS_MESSAGE_ERROR} message={messageText} />
);

export class ChangePasswordPage extends PureComponent {
  static navigationOptions = {
    headerTitle: 'Change your password',
    headerMode: 'screen',
  };

  render() {
    const { onChangeField, onSubmit, formFieldValues, errorMessage, isLoading, invalidFields } =
      this.props;

    return (
      <MenuContext style={localStyles.menuContainer}>
        <TupaiaBackground style={localStyles.container}>
          <StatusBar barStyle="dark-content" />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            keyboardVerticalOffset={50}
            style={localStyles.container}
          >
            <ScrollView
              contentContainerStyle={localStyles.formContainer}
              scrollEnabled={!isLoading}
              ref={scrollView => {
                this.scrollView = scrollView;
              }}
            >
              {errorMessage ? renderErrorMessage(errorMessage) : null}
              <Form
                fields={fields}
                invalidFields={invalidFields}
                onFieldChange={onChangeField}
                fieldValues={formFieldValues}
              />
              <View style={localStyles.actionsContainer}>
                <Button title="Change Password" isDisabled={isLoading} onPress={() => onSubmit()} />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          {isLoading ? renderLoadingOverlay() : null}
        </TupaiaBackground>
      </MenuContext>
    );
  }
}

ChangePasswordPage.propTypes = {
  formFieldValues: PropTypes.shape({
    oldPassword: PropTypes.string.isRequired,
    newPassword: PropTypes.string.isRequired,
    newPasswordConfirm: PropTypes.string.isRequired,
  }).isRequired,
  isLoading: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  invalidFields: PropTypes.array.isRequired,
  onChangeField: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

const localStyles = StyleSheet.create({
  menuContainer: {
    flex: 1,
  },
  container: {
    width: '100%',
    flex: 1,
  },
  formContainer: {
    padding: DEFAULT_PADDING,
    flexGrow: 1,
  },
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getThemeColorOneFaded(0.4),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const fields = [
  {
    label: 'Current password',
    key: 'oldPassword',
    secureTextEntry: true,
  },
  {
    label: 'New password',
    key: 'newPassword',
    secureTextEntry: true,
  },
  {
    label: 'Confirm new password',
    key: 'newPasswordConfirm',
    secureTextEntry: true,
  },
];
