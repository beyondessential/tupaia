/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * History middleware. This specifies the interface between the site and the url
 */

import {
  SELECT_PROJECT,
  CHANGE_ORG_UNIT,
  CHANGE_DASHBOARD_GROUP,
  OPEN_ENLARGED_DIALOG,
  CLOSE_ENLARGED_DIALOG,
  CHANGE_MEASURE,
  CLEAR_MEASURE,
  GO_HOME,
  doUpdateUrl,
} from '../actions';

import { setUrlComponent, clearUrl, attemptPushHistory } from './historyNavigation';

import { URL_COMPONENTS } from './constants';

export const reactToInitialState = () => {
  // This will be implemented in future PRs
};

export const historyMiddleware = state => next => action => {
  const { dispatch } = state;
  let newLocation = state.getState().routing;
  switch (action.type) {
    // Actions that modify the path
    case SELECT_PROJECT:
      newLocation = setUrlComponent(URL_COMPONENTS.PROJECT, action.projectCode, newLocation);
      dispatch(doUpdateUrl(newLocation));
      break;
    case CHANGE_ORG_UNIT:
      newLocation = setUrlComponent(
        URL_COMPONENTS.ORG_UNIT,
        action.organisationUnitCode,
        newLocation,
      );
      dispatch(doUpdateUrl(newLocation));
      break;
    case CHANGE_DASHBOARD_GROUP:
      newLocation = setUrlComponent(URL_COMPONENTS.DASHBOARD, action.name, newLocation);
      dispatch(doUpdateUrl(newLocation));
      break;
    case GO_HOME:
      newLocation = clearUrl();
      dispatch(doUpdateUrl(newLocation));
      break;

    // Actions that modify search params
    case OPEN_ENLARGED_DIALOG:
      newLocation = setUrlComponent(URL_COMPONENTS.REPORT, action.viewContent.viewId, newLocation);
      dispatch(doUpdateUrl(newLocation));
      break;
    case CLOSE_ENLARGED_DIALOG:
      newLocation = setUrlComponent(URL_COMPONENTS.REPORT, null, newLocation);
      dispatch(doUpdateUrl(newLocation));
      break;
    case CHANGE_MEASURE:
      newLocation = setUrlComponent(URL_COMPONENTS.MEASURE, action.measureId, newLocation);
      dispatch(doUpdateUrl(newLocation));
      break;
    case CLEAR_MEASURE:
      newLocation = setUrlComponent(URL_COMPONENTS.MEASURE, null, newLocation);
      dispatch(doUpdateUrl(newLocation));
      break;
    default:
      return next(action);
  }

  return next(action);
};

export const initHistoryDispatcher = store => {
  // Update Redux if we navigated via browser's back/forward
  // most browsers restore scroll position automatically
  // as long as we make content scrolling happen on document.body
  window.addEventListener('popstate', () => {
    // here `doUpdateUrl` is an action creator that
    // takes the new url and stores it in Redux.
    store.dispatch(doUpdateUrl(window.location));
  });

  // The other part of the two-way binding is updating the displayed
  // URL in the browser if we change it inside our app state in Redux.
  // We can simply subscribe to Redux and update it if it's different.
  store.subscribe(() => {
    const { pathname, search } = store.getState().routing;
    attemptPushHistory(pathname, search);
  });
};
