/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * History middleware. This specifies the interface between the site and the url
 */

import {
  SET_PROJECT,
  SET_ORG_UNIT,
  SET_DASHBOARD_GROUP,
  OPEN_ENLARGED_DIALOG,
  CLOSE_ENLARGED_DIALOG,
  SET_MEASURE,
  CLEAR_MEASURE,
  GO_HOME,
  updateHistoryLocation,
  setOrgUnit,
  setMeasure,
  setOverlayComponent,
  goHome,
  setVerifyEmailToken,
  setPasswordResetToken,
  openUserPage,
  DIALOG_PAGE_ONE_TIME_LOGIN,
  openEnlargedDialog,
} from '../actions';
import { setProject } from '../projects/actions';
import { DEFAULT_PROJECT_CODE } from '../defaults';
import {
  setLocationComponent,
  clearLocation,
  attemptPushHistory,
  getInitialLocationComponents,
} from './historyNavigation';
import { URL_COMPONENTS, PASSWORD_RESET_PREFIX, VERIFY_EMAIL_PREFIX } from './constants';

export const reactToInitialState = store => {
  const { dispatch: rawDispatch } = store;
  const dispatch = action => rawDispatch({ ...action, meta: { preventHistoryUpdate: true } });

  const { userPage, projectSelector, ...otherComponents } = getInitialLocationComponents();
  if (userPage) {
    reactToUserPage(userPage, otherComponents, dispatch);
    return;
  }

  if (projectSelector) {
    // Set project to explore, this is the default
    rawDispatch(setProject(DEFAULT_PROJECT_CODE));
    return;
  }

  dispatch(setOverlayComponent(null));
  dispatch(setProject(otherComponents[URL_COMPONENTS.PROJECT]));

  if (otherComponents[URL_COMPONENTS.ORG_UNIT])
    dispatch(setOrgUnit(otherComponents[URL_COMPONENTS.ORG_UNIT]));

  if (otherComponents[URL_COMPONENTS.MEASURE])
    dispatch(setMeasure(otherComponents[URL_COMPONENTS.MEASURE]));

  if (otherComponents[URL_COMPONENTS.REPORT])
    dispatch(openEnlargedDialog(otherComponents[URL_COMPONENTS.REPORT]));
};

const reactToUserPage = (userPage, initialComponents, dispatch) => {
  switch (userPage) {
    case PASSWORD_RESET_PREFIX:
      dispatch(setPasswordResetToken(initialComponents[URL_COMPONENTS.PASSWORD_RESET_TOKEN]));
      dispatch(openUserPage(DIALOG_PAGE_ONE_TIME_LOGIN));
      break;
    case VERIFY_EMAIL_PREFIX:
      dispatch(setVerifyEmailToken(initialComponents[URL_COMPONENTS.VERIFY_EMAIL_TOKEN]));
      break;
    default:
      console.error('Unhandled user page', userPage);
  }
};

export const historyMiddleware = store => next => action => {
  if (action.meta && action.meta.preventHistoryUpdate) return next(action);

  switch (action.type) {
    // Actions that modify the path
    case SET_PROJECT:
      dispatchLocationUpdate(store, URL_COMPONENTS.PROJECT, action.projectCode);
      break;
    case SET_ORG_UNIT:
      dispatchLocationUpdate(store, URL_COMPONENTS.ORG_UNIT, action.organisationUnitCode);
      break;
    case SET_DASHBOARD_GROUP:
      dispatchLocationUpdate(store, URL_COMPONENTS.DASHBOARD, action.name);
      break;
    // TODO: Investigate GO_HOME once all url functionality is implemented.
    case GO_HOME:
      // Completely clear location, explore project will be set in a saga.
      dispatchClearLocation(store);
      break;

    // Actions that modify search params
    case OPEN_ENLARGED_DIALOG:
      dispatchLocationUpdate(store, URL_COMPONENTS.REPORT, action.viewId);
      break;
    case CLOSE_ENLARGED_DIALOG:
      dispatchLocationUpdate(store, URL_COMPONENTS.REPORT, null);
      break;
    case SET_MEASURE:
      dispatchLocationUpdate(store, URL_COMPONENTS.MEASURE, action.measureId);
      break;
    case CLEAR_MEASURE:
      dispatchLocationUpdate(store, URL_COMPONENTS.MEASURE, null);
      break;
    default:
  }

  return next(action);
};

// This function and the corresponding architecture are from this blog post:
// https://read.reduxbook.com/markdown/part2/09-routing.html
export const initHistoryDispatcher = store => {
  // Update Redux if we navigated via browser's back/forward
  // most browsers restore scroll position automatically
  // as long as we make content scrolling happen on document.body
  window.addEventListener('popstate', () => {
    // here `updateHistoryLocation` is an action creator that
    // takes the new location and stores it in Redux.
    // TODO: popstate app reactions will be handled in the relevant PR
    store.dispatch(updateHistoryLocation(window.location));
  });

  // The other part of the two-way binding is updating the displayed
  // URL in the browser if we change it inside our app state in Redux.
  // We can simply subscribe to Redux and update it if it's different.
  store.subscribe(() => {
    const { pathname, search } = store.getState().routing;
    attemptPushHistory(pathname, search);
  });
};

const dispatchLocationUpdate = (store, component, value) => {
  const { dispatch } = store;
  const { routing } = store.getState();

  const newLocation = setLocationComponent(routing, component, value);
  dispatch(updateHistoryLocation(newLocation));
};

const dispatchClearLocation = store => {
  const { dispatch } = store;
  dispatch(updateHistoryLocation(clearLocation()));
};
