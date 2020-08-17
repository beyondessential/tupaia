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
  CHANGE_DASHBOARD_GROUP,
  OPEN_ENLARGED_DIALOG,
  CLOSE_ENLARGED_DIALOG,
  CHANGE_MEASURE,
  CLEAR_MEASURE,
  GO_HOME,
  updateHistoryLocation,
  onSetOrgUnit,
  setOverlayComponent,
  goHome,
} from '../actions';
import { onSetProject } from '../projects/actions';
import {
  setLocationComponent,
  clearLocation,
  attemptPushHistory,
  getInitialLocationComponents,
} from './historyNavigation';
import { URL_COMPONENTS } from './constants';

export const reactToInitialState = ({ dispatch }) => {
  const { userPage, projectSelector, ...otherComponents } = getInitialLocationComponents();

  if (userPage) {
    // To implement in a future PR
    dispatch(goHome());
  }

  if (projectSelector) {
    // No need to do anything, this is the default
    return;
  }

  dispatch(setOverlayComponent(null));
  dispatch(onSetProject(otherComponents[URL_COMPONENTS.PROJECT], false));
  if (otherComponents[URL_COMPONENTS.ORG_UNIT])
    dispatch(onSetOrgUnit(otherComponents[URL_COMPONENTS.ORG_UNIT], true));
};

export const historyMiddleware = store => next => action => {
  const { dispatch } = store;
  switch (action.type) {
    // Actions that modify the path
    case SET_PROJECT:
      dispatchLocationUpdate(store, URL_COMPONENTS.PROJECT, action.projectCode);
      dispatch(onSetProject(action.projectCode));
      break;
    case SET_ORG_UNIT:
      dispatchLocationUpdate(store, URL_COMPONENTS.ORG_UNIT, action.organisationUnitCode);
      dispatch(onSetOrgUnit(action.organisationUnitCode));
      break;
    case CHANGE_DASHBOARD_GROUP:
      dispatchLocationUpdate(store, URL_COMPONENTS.DASHBOARD, action.name);
      break;
    case GO_HOME:
      dispatchClearLocation(store);
      break;

    // Actions that modify search params
    case OPEN_ENLARGED_DIALOG:
      dispatchLocationUpdate(store, URL_COMPONENTS.REPORT, action.viewContent.viewId);
      break;
    case CLOSE_ENLARGED_DIALOG:
      dispatchLocationUpdate(store, URL_COMPONENTS.REPORT, null);
      break;
    case CHANGE_MEASURE:
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
