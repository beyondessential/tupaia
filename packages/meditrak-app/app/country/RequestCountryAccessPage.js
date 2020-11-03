/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { MenuContext } from 'react-native-menu';
import PropTypes from 'prop-types';

import {
  Form,
  FIELD_TYPES,
  Button,
  StatusMessage,
  STATUS_MESSAGE_SUCCESS,
  STATUS_MESSAGE_ERROR,
  Text,
} from '../widgets';

import {
  BORDER_RADIUS,
  getThemeColorOneFaded,
  DEFAULT_PADDING,
  THEME_COLOR_ONE,
  THEME_FONT_SIZE_ONE,
} from '../globalStyles';

const renderLoadingOverlay = () => (
  <View style={localStyles.overlay}>
    <ActivityIndicator size="large" />
  </View>
);

const renderCompleteMessage = () => (
  <StatusMessage
    type={STATUS_MESSAGE_SUCCESS}
    message="Thank you for your country request. We will review your application and respond by email shortly."
  />
);

const renderErrorMessage = messageText => (
  <StatusMessage type={STATUS_MESSAGE_ERROR} message={messageText} />
);

const renderNoCountries = () => (
  <StatusMessage
    type={STATUS_MESSAGE_SUCCESS}
    message="You currently have access to all available countries."
  />
);

export class RequestCountryAccessPage extends React.Component {
  static navigationOptions = {
    title: 'Request country access',
  };

  constructor(props) {
    super(props);

    this.state = {
      countries: [],
    };
  }

  componentWillMount() {
    this.initCountries();
  }

  componentWillReceiveProps(nextProps) {
    const { errorMessage } = this.props;
    const hasNewErrorMessage = errorMessage === '' && nextProps.errorMessage !== '';
    if (hasNewErrorMessage || nextProps.isComplete) {
      // Scroll to error message.
      this.scrollView.scrollTo({ y: 0 });
    }
  }

  onChangeField(fieldName, fieldValue) {
    const { formFieldValues, onFormFieldChange } = this.props;
    const fieldValues = { ...formFieldValues };

    fieldValues[fieldName] = fieldValue;

    onFormFieldChange(fieldValues);
  }

  getFormFields() {
    const formFields = [];

    const { countries } = this.state;

    countries.forEach(({ key, label }) => {
      formFields.push({
        label,
        key,
        type: FIELD_TYPES.CHECKBOX,
        fieldStyle: {
          marginBottom: 0,
        },
      });
    });

    formFields.push({
      type: FIELD_TYPES.MULTILINE,
      label: 'Why would you like access?',
      key: 'message',
    });

    return formFields;
  }

  initCountries() {
    const { accessPolicy, getCountries } = this.props;
    const countries = getCountries();

    const restrictedCountries = countries
      .filter(country => !accessPolicy.allows(country.code))
      .map(country => ({
        key: country.id,
        label: country.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    this.setState({
      countries: restrictedCountries,
    });
  }

  submitForm() {
    const { formFieldValues, onSubmitFields } = this.props;

    const selectedCountries = Object.keys(formFieldValues)
      .filter(fieldName => fieldName !== 'message') // Filter out the message field value.
      .filter(fieldName => formFieldValues[fieldName]); // Filter out any checkboxes not checked.

    onSubmitFields({
      entityIds: selectedCountries,
      message: formFieldValues.message,
    });
  }

  render() {
    const { countries } = this.state;
    const { screenProps, errorMessage, isLoading, isComplete, formFieldValues } = this.props;

    const { BackgroundComponent } = screenProps;
    const restrictedCountries = countries;

    if (restrictedCountries.length === 0) {
      return (
        <MenuContext style={localStyles.menuContainer}>
          <BackgroundComponent style={localStyles.container}>
            <View style={localStyles.noCountries}>{renderNoCountries()}</View>
          </BackgroundComponent>
        </MenuContext>
      );
    }

    return (
      <MenuContext style={localStyles.menuContainer}>
        <BackgroundComponent style={localStyles.container}>
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
              {isComplete ? renderCompleteMessage() : null}
              {errorMessage ? renderErrorMessage(errorMessage) : null}
              <Text style={localStyles.formHeader}>
                Select the countries you would like access to:
              </Text>
              <Form
                fields={this.getFormFields()}
                onFieldChange={(fieldName, fieldValue) => this.onChangeField(fieldName, fieldValue)}
                fieldValues={formFieldValues}
              />
              <View style={localStyles.actionsContainer}>
                <Button
                  title="Request access"
                  isDisabled={isComplete}
                  onPress={() => this.submitForm()}
                />
              </View>
            </ScrollView>
            {isLoading ? renderLoadingOverlay() : null}
          </KeyboardAvoidingView>
        </BackgroundComponent>
      </MenuContext>
    );
  }
}

RequestCountryAccessPage.propTypes = {
  screenProps: PropTypes.object.isRequired,
  onFormFieldChange: PropTypes.func.isRequired,
  onSubmitFields: PropTypes.func.isRequired,
  getCountries: PropTypes.func.isRequired,
  isComplete: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  isLoading: PropTypes.bool,
  formFieldValues: PropTypes.object,
  accessPolicy: PropTypes.object.isRequired,
};

RequestCountryAccessPage.defaultProps = {
  errorMessage: '',
  isLoading: false,
  formFieldValues: {},
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
  formHeader: {
    fontSize: THEME_FONT_SIZE_ONE,
    color: THEME_COLOR_ONE,
    marginVertical: 12,
  },
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  textInput: {
    flex: 1,
    padding: 0,
    paddingTop: 15,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getThemeColorOneFaded(0.4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: THEME_COLOR_ONE,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    borderColor: '#CCC',
    padding: 20,
  },
  noCountries: {
    width: '80%',
    height: '100%',
    justifyContent: 'center',
    alignSelf: 'center',
    flex: 1,
  },
});
