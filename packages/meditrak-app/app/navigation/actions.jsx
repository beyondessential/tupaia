import { NavigationActions, StackActions } from 'react-navigation';
import { Alert } from 'react-native';

import {
  TOGGLE_SIDE_MENU,
  CHANGE_PASSWORD_SCREEN,
  CREATE_ACCOUNT_SCREEN,
  DELETE_ACCOUNT_REQUEST_SCREEN,
  LOGIN_SCREEN,
  REALM_EXPLORER_SCREEN,
  REQUEST_COUNTRY_ACCESS_SCREEN,
  SYNC_SCREEN,
  WELCOME_SCREEN,
  SURVEY_SCREEN,
  SURVEYS_MENU_SCREEN,
  WEB_BROWSER_SCREEN,
  HOME_SCREEN,
  QR_CODES_SCREEN,
} from './constants';
import { getIsInSurvey } from './selectors';
import { logout } from '../authentication';
import { setBaseUrl } from '../web';
import { stopWatchingUserLocation } from '../utilities/userLocation';

export const goBack =
  (shouldAlertIfInSurvey = true) =>
  (dispatch, getState) => {
    if (shouldAlertIfInSurvey && getIsInSurvey(getState())) {
      notifyUserAboutOngoingAssessment(() => {
        dispatch(NavigationActions.back());
      });
    } else {
      dispatch(NavigationActions.back());
    }
  };

export const resetToHome = () =>
  StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: HOME_SCREEN })],
  });

export const resetToLogin = () =>
  StackActions.reset({
    index: 0,
    actions: [
      NavigationActions.navigate({
        routeName: LOGIN_SCREEN,
      }),
    ],
  });

export const viewSyncPage = () => navigateToScreen(SYNC_SCREEN);

export const goToQrCodesPage = (survey, qrCodes, onClose) =>
  navigateToScreen(QR_CODES_SCREEN, survey, { qrCodes, onClose });

export const goToCreateAccount = () => dispatch => {
  dispatch(
    NavigationActions.navigate({
      routeName: CREATE_ACCOUNT_SCREEN,
    }),
  );
};

export const openSurvey = () => navigateToScreen(SURVEY_SCREEN);

export const openSurveyGroup = (surveyGroupId, surveyGroupName) =>
  NavigationActions.navigate({
    routeName: SURVEYS_MENU_SCREEN,
    key: `SURVEY_GROUP_MENU_SCREEN_${surveyGroupId}`,
    params: {
      title: surveyGroupName,
      surveyGroupId,
    },
  });

export const resetToWelcomeScreen = () => dispatch => {
  dispatch(
    StackActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({
          routeName: WELCOME_SCREEN,
        }),
      ],
    }),
  );
};

export const toggleSideMenu = isOpen => ({
  type: TOGGLE_SIDE_MENU,
  isOpen,
});

export const navigateToRequestCountryAccess = () =>
  NavigationActions.navigate({
    routeName: REQUEST_COUNTRY_ACCESS_SCREEN,
  });

const notifyUserAboutOngoingAssessment = proceedCallback => {
  Alert.alert(
    'Survey in progress',
    "If you exit, you will lose the progress you've made on the current survey.",
    [
      { text: 'Exit', onPress: proceedCallback },
      { text: 'Continue Survey', onPress: () => {}, style: 'cancel' },
    ],
    { cancelable: true },
  );
};

const goToRoute = (routeName, dispatch) => {
  dispatch(toggleSideMenu(false));

  switch (routeName) {
    case HOME_SCREEN:
      return dispatch(resetToHome());

    case SURVEYS_MENU_SCREEN:
      return dispatch(navigateToSurveysMenu());

    case REQUEST_COUNTRY_ACCESS_SCREEN:
      return dispatch(navigateToRequestCountryAccess());

    case REALM_EXPLORER_SCREEN:
      return dispatch(
        NavigationActions.navigate({
          routeName: REALM_EXPLORER_SCREEN,
        }),
      );

    case CHANGE_PASSWORD_SCREEN:
      return dispatch(navigateToScreen(CHANGE_PASSWORD_SCREEN));

    case DELETE_ACCOUNT_REQUEST_SCREEN:
      return dispatch(navigateToScreen(DELETE_ACCOUNT_REQUEST_SCREEN));

    case 'logout':
    default:
      return dispatch(logout());
  }
};

export const selectSideMenuItem = itemKey => (dispatch, getState) => {
  if (getIsInSurvey(getState())) {
    return notifyUserAboutOngoingAssessment(() => {
      goToRoute(itemKey, dispatch);
      dispatch(stopWatchingUserLocation());
    });
  }
  return goToRoute(itemKey, dispatch);
};

export const navigateToScreen = (routeName, title, params = {}) =>
  NavigationActions.navigate({
    routeName,
    params: {
      title,
      ...params,
    },
  });

export const replaceCurrentScreen =
  (routeName, title, params = {}) =>
  (dispatch, getState) => {
    const { nav } = getState();
    const { routes } = nav;
    const currentRoute = routes[nav.index];
    dispatch(
      StackActions.replace({
        key: currentRoute.key,
        routeName,
        params,
      }),
    );
  };

export const navigateToSurveysMenu = () => dispatch => {
  dispatch(navigateToScreen(SURVEYS_MENU_SCREEN));
};

export const loadWebsite = websiteUrl => dispatch => {
  dispatch(setBaseUrl(websiteUrl));
  dispatch(
    NavigationActions.navigate({
      routeName: WEB_BROWSER_SCREEN,
      params: {
        title: websiteUrl,
      },
    }),
  );
};

export const navigateToTupaiaWebsite = () => dispatch => {
  dispatch(loadWebsite('https://mobile.tupaia.org'));
};
