import React, { PureComponent } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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
  Button,
  StatusMessage,
  TupaiaBackground,
  Coconut,
  Pig,
  STATUS_MESSAGE_SUCCESS,
} from '../widgets';
import {
  getThemeColorOneFaded,
  DEFAULT_PADDING,
  THEME_TEXT_COLOR_THREE,
  THEME_COLOR_THREE,
  THEME_COLOR_DARK,
  THEME_FONT_SIZE_ONE,
  THEME_FONT_SIZE_THREE,
  THEME_TEXT_COLOR_FOUR,
} from '../globalStyles';
import { TUPAIA_BACKGROUND_THEME } from '../widgets/TupaiaBackground';

const REWARD_ICON_SIZE = 25;

const renderLoadingOverlay = () => (
  <View style={localStyles.loadingOverlay}>
    <ActivityIndicator size="large" />
  </View>
);

const renderSuccessMessage = messageText => (
  <StatusMessage
    type={STATUS_MESSAGE_SUCCESS}
    message={messageText}
    theme="secondary"
    style={localStyles.renderSuccessMessage}
  />
);

export class RequestAccountDeletionPage extends PureComponent {
  static navigationOptions = {
    headerTitle: 'Delete account',
    headerMode: 'screen',
  };

  render() {
    const { onSubmit, isRequestedAccountDeletion, isLoading, emailAddress, name, pigs, coconuts } =
      this.props;

    return (
      <MenuContext style={localStyles.menuContainer}>
        <TupaiaBackground style={localStyles.container} theme={TUPAIA_BACKGROUND_THEME.WHITE}>
          <StatusBar barStyle="dark-content" />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            keyboardVerticalOffset={50}
            style={localStyles.container}
          >
            <ScrollView
              contentContainerStyle={localStyles.scrollContainer}
              scrollEnabled={!isLoading}
              ref={scrollView => {
                this.scrollView = scrollView;
              }}
            >
              <Text style={localStyles.yourAccount}>Your account</Text>
              <View style={localStyles.user}>
                <View>
                  <Text style={localStyles.userName}>{name}</Text>
                  <Text style={localStyles.userEmail}>{emailAddress}</Text>
                  <View style={localStyles.userSubDetail}>
                    <Coconut size={REWARD_ICON_SIZE} />
                    <Text style={localStyles.rewardText}>{coconuts}</Text>
                    <Pig size={REWARD_ICON_SIZE} />
                    <Text style={localStyles.rewardText}>{pigs}</Text>
                  </View>
                </View>
              </View>
              {isRequestedAccountDeletion && renderSuccessMessage('Your request has been sent')}
              <View style={localStyles.actionsContainer}>
                <Button
                  style={localStyles.deleteButton}
                  textStyle={localStyles.deleteButtonText}
                  title="Delete Account"
                  isDisabled={isLoading || isRequestedAccountDeletion}
                  onPress={() => onSubmit()}
                />
              </View>
              <Text style={{ color: THEME_COLOR_DARK }}>
                By requesting your account to be deleted, you will still be able to login.{'\n\n'}
                You will be contacted shortly to confirm your account deletion request.
              </Text>
            </ScrollView>
          </KeyboardAvoidingView>
          {isLoading && renderLoadingOverlay()}
        </TupaiaBackground>
      </MenuContext>
    );
  }
}

RequestAccountDeletionPage.propTypes = {
  name: PropTypes.string.isRequired,
  emailAddress: PropTypes.string.isRequired,
  pigs: PropTypes.number.isRequired,
  coconuts: PropTypes.number.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isRequestedAccountDeletion: PropTypes.bool.isRequired,
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
  scrollContainer: {
    padding: DEFAULT_PADDING,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getThemeColorOneFaded(0.4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  user: {
    padding: DEFAULT_PADDING,

    width: '100%',
  },
  yourAccount: {
    color: THEME_TEXT_COLOR_THREE,
    fontSize: THEME_FONT_SIZE_ONE,
    fontWeight: 'bold',
  },
  userName: {
    color: THEME_TEXT_COLOR_THREE,
    fontSize: THEME_FONT_SIZE_THREE,
    fontWeight: '500',
    alignItems: 'center',
    letterSpacing: 0.5,
  },
  userEmail: {
    color: THEME_TEXT_COLOR_FOUR,
    fontSize: THEME_FONT_SIZE_ONE,
    marginBottom: 12,
    fontWeight: '500',
    alignItems: 'center',
    letterSpacing: 0.5,
  },
  userSubDetail: {
    alignItems: 'center',
    flexDirection: 'row',
    opacity: 0.8,
  },
  rewardText: {
    color: THEME_TEXT_COLOR_THREE,
    fontWeight: 'bold',
    marginRight: 20,
    marginLeft: 5,
  },
  renderSuccessMessage: {
    marginBottom: 0,
    backgroundColor: '#E0F1DC',
    alignItems: 'center',
  },
  deleteButton: {
    width: '100%',
    backgroundColor: THEME_COLOR_THREE,
  },
  deleteButtonText: { color: 'white', fontWeight: 'bold' },
});
