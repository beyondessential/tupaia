import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { MenuContext } from 'react-native-menu';
import {
  Form,
  FIELD_TYPES,
  Button,
  StatusMessage,
  STATUS_MESSAGE_ERROR,
  TupaiaBackground,
} from '../widgets';
import { USER_AGREE_TERMS } from './constants';
import * as userFieldConstants from './userFieldConstants';
import { getThemeColorOneFaded, DEFAULT_PADDING } from '../globalStyles';
import { checkIfObjectsAreEqual } from '../utilities';

const renderLoadingOverlay = () => (
  <View style={localStyles.loadingOverlay}>
    <ActivityIndicator size="large" />
  </View>
);

const renderErrorMessage = messageText => (
  <StatusMessage type={STATUS_MESSAGE_ERROR} message={messageText} />
);

export class CreateUserPage extends React.Component {
  static navigationOptions = {
    headerTitle: 'Create an account',
    headerMode: 'screen',
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.errorMessage !== '' &&
      !nextProps.isLoading &&
      checkIfObjectsAreEqual(this.props.formFieldValues, nextProps.formFieldValues)
    ) {
      //  Scroll to error message.
      this.scrollView.scrollTo({ y: 0 });
    }
  }

  render() {
    const {
      buttonText,
      submitIsEnabled,
      onChangeNewUserField,
      onSubmitFields,
      formFieldValues,
      errorMessage,
      isLoading,
      invalidFields,
    } = this.props;

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
                onFieldChange={onChangeNewUserField}
                fieldValues={formFieldValues}
              />
              <View style={localStyles.actionsContainer}>
                <Button
                  title={buttonText}
                  isDisabled={!submitIsEnabled}
                  onPress={() => onSubmitFields(formFieldValues)}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          {isLoading ? renderLoadingOverlay() : null}
        </TupaiaBackground>
      </MenuContext>
    );
  }
}

CreateUserPage.propTypes = {
  onChangeNewUserField: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
  submitIsEnabled: PropTypes.bool,
  onSubmitFields: PropTypes.func.isRequired,
  formFieldValues: PropTypes.object.isRequired,
  errorMessage: PropTypes.string,
  isLoading: PropTypes.bool,
  invalidFields: PropTypes.array,
};

CreateUserPage.defaultProps = {
  buttonText: 'Create account',
  submitIsEnabled: true,
  errorMessage: '',
  isLoading: false,
  invalidFields: [],
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
  formInutHalf: {
    width: '47%', // Let space between in form add 3% padding between items.
  },
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getThemeColorOneFaded(0.4),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Must appear below styles.
const fields = [
  {
    label: 'First Name',
    key: userFieldConstants.USER_FIRST_NAME_KEY,
    fieldStyle: localStyles.formInutHalf,
  },
  {
    label: 'Last Name',
    key: userFieldConstants.USER_LAST_NAME_KEY,
    fieldStyle: localStyles.formInutHalf,
  },
  {
    label: 'Email Address',
    key: userFieldConstants.USER_EMAIL_KEY,
    keyboardType: 'email-address',
  },
  {
    label: 'Password',
    key: userFieldConstants.USER_PASSWORD_KEY,
    secureTextEntry: true,
  },
  {
    label: 'Confirm Password',
    key: userFieldConstants.USER_PASSWORD_CONFIRM_KEY,
    secureTextEntry: true,
  },
  {
    label: 'Contact Number',
    key: userFieldConstants.USER_CONTACT_NUMBER_KEY,
    keyboardType: 'phone-pad',
  },
  {
    label: 'Employer',
    key: userFieldConstants.USER_EMPLOYER_KEY,
  },
  {
    label: 'Position',
    key: userFieldConstants.USER_POSITION_KEY,
  },
  {
    label: (
      <Text>
        I agree to the{' '}
        <Text
          style={localStyles.termsLink}
          onPress={() => Linking.openURL('https://beyondessential.com.au/terms-and-conditions/')}
        >
          terms and conditions
        </Text>
      </Text>
    ),
    key: USER_AGREE_TERMS,
    type: FIELD_TYPES.CHECKBOX,
  },
];
