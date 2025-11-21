import React from 'react';
import { Platform } from 'react-native';
import { CardStyleInterpolators, createStackNavigator } from 'react-navigation-stack';

import { HeaderToolbar } from './HeaderToolbar';
import { HeaderLeftButton } from './HeaderLeftButton';

import {
  LoginContainer,
  NoInternetForgotPasswordContainer,
  WelcomeContainer,
} from '../authentication';
import { RequestCountryAccessContainer } from '../country';
import { CreateUserContainer } from '../user';
import { HomeScreenContainer } from '../home';
import { WebBrowserContainer } from '../web';
import { ChangePasswordContainer } from '../changePassword';
import { RealmExplorer } from '../database/RealmExplorer';
import { RequestAccountDeletionContainer } from '../requestAccountDeletion';
import { QrCodeScreen, SurveyScreen, SurveysMenuScreen } from '../assessment';
import {
  CHANGE_PASSWORD_SCREEN,
  CREATE_ACCOUNT_SCREEN,
  DELETE_ACCOUNT_REQUEST_SCREEN,
  HOME_SCREEN,
  LOGIN_SCREEN,
  NO_INTERNET_FORGOT_PASSWORD_SCREEN,
  QR_CODES_SCREEN,
  REALM_EXPLORER_SCREEN,
  REQUEST_COUNTRY_ACCESS_SCREEN,
  ROUTES_WITH_INVISIBLE_HEADERS,
  SURVEY_SCREEN,
  SURVEYS_MENU_SCREEN,
  SYNC_SCREEN,
  WEB_BROWSER_SCREEN,
  WELCOME_SCREEN,
} from './constants';
import { SyncContainer } from '../sync';
import { THEME_COLOR_ONE } from '../globalStyles';

const INITIAL_SCREEN_NAME = 'Login';

const routes = {
  [CHANGE_PASSWORD_SCREEN]: { screen: ChangePasswordContainer },
  [DELETE_ACCOUNT_REQUEST_SCREEN]: { screen: RequestAccountDeletionContainer },
  [LOGIN_SCREEN]: { screen: LoginContainer, navigationOptions: () => ({ headerShown: false }) },
  [NO_INTERNET_FORGOT_PASSWORD_SCREEN]: {
    screen: NoInternetForgotPasswordContainer,
    navigationOptions: () => ({ headerShown: false }),
  },
  [REQUEST_COUNTRY_ACCESS_SCREEN]: { screen: RequestCountryAccessContainer },
  [WELCOME_SCREEN]: {
    screen: WelcomeContainer,
    navigationOptions: () => ({ headerShown: false, animationEnabled: false }),
  },
  [CREATE_ACCOUNT_SCREEN]: {
    screen: CreateUserContainer,
    navigationOptions: () => ({ headerRight: () => null }),
  },
  [HOME_SCREEN]: {
    screen: HomeScreenContainer,
    navigationOptions: () => ({ headerLeft: () => null, animationEnabled: false }),
  },
  [QR_CODES_SCREEN]: { screen: QrCodeScreen },
  [SYNC_SCREEN]: {
    screen: SyncContainer,
    navigationOptions: () => ({
      cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS, // vertical transition for Sync Screen
    }),
  },
  [SURVEY_SCREEN]: {
    screen: SurveyScreen,
    navigationOptions: () => ({
      cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS, // vertical transition for Survey Screen
    }),
  },
  [SURVEYS_MENU_SCREEN]: { screen: SurveysMenuScreen },
  [WEB_BROWSER_SCREEN]: { screen: WebBrowserContainer },
  [REALM_EXPLORER_SCREEN]: { screen: RealmExplorer },
};

// Combats rn issue of font weights not being respected in Android
// https://github.com/react-community/react-navigation/issues/542
const androidHeaderTitleStyle = {
  fontWeight: '400',
  // Android 5 and above have support for Roboto medium font.
  fontFamily: Platform.Version < 21 ? 'sans-serif' : 'sans-serif-medium',
};

const isInvisibleHeader = navigation =>
  navigation.state && ROUTES_WITH_INVISIBLE_HEADERS.includes(navigation.state.routeName);

const config = {
  initialRouteName: INITIAL_SCREEN_NAME,
  initialRouteParams: { surveyScreenIndex: 0 },
  headerMode: 'float',
  defaultNavigationOptions: ({ navigation }) => ({
    headerLeft: () => <HeaderLeftButton />,
    headerTitle: () => null,
    headerBackTitle: null,
    headerStyle: isInvisibleHeader(navigation)
      ? {
          backgroundColor: THEME_COLOR_ONE,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        }
      : {
          backgroundColor: THEME_COLOR_ONE,
        },
    headerTitleStyle: {
      color: '#222',
      ...(Platform.OS === 'android' ? androidHeaderTitleStyle : {}),
    },
    headerTitleAlign: 'center',
    headerRight: () => <HeaderToolbar />,
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // horizontal transition by default
  }),
};

export const Navigator = createStackNavigator(routes, config);
