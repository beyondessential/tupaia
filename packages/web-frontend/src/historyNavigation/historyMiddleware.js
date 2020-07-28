/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * History navigation.
 *
 * Url writing and interpreting for Tupaia. Urls are in the format
 *
 * /[project_code]/[entity_code]?m={measureId}&p={overlayPageName}
 *
 * eg
 * /PROJECT_CODE/ENTITY_CODE?m=124 - Load the given entity with measure 124 active.
 * /?p=about - Loads the home page with about overlay shown.
 */

import {
  SET_PROJECT,
  SET_ORG_UNIT,
  CHANGE_DASHBOARD_GROUP,
  SET_ENLARGED_REPORT,
  CLOSE_ENLARGED_REPORT,
  SET_MEASURE,
  CLEAR_MEASURE,
  GO_HOME,
  onSetOrgUnit,
  setOverlayComponent,
  doUpdateUrl,
  onSetMeasure,
  onOpenEnlargedDialog,
  setEnlargedDashboardDateRange,
} from '../actions';

import { onSetProject } from '../projects/actions';

import {
  setUrlComponent,
  getCurrentLocation,
  getInitialtUrlComponents,
  getInternalInitialLocation,
  clearUrl,
  pushHistory,
} from './historyNavigation';

import { URL_COMPONENTS } from './constants';

export const reactToInitialState = ({ dispatch }) => {
  const { userPage, ...otherComponents } = getInitialtUrlComponents();
  console.log(otherComponents);
  dispatch(doUpdateUrl(getInternalInitialLocation()));

  if (userPage) {
    dispatch(setOverlayComponent(null));
    console.log('Ahhh!');
  }

  if (!otherComponents[URL_COMPONENTS.PROJECT]) {
    dispatch(onSetProject(null, false));
    return;
  }

  dispatch(setOverlayComponent(null));
  dispatch(onSetProject(otherComponents[URL_COMPONENTS.PROJECT], false));
  if (otherComponents[URL_COMPONENTS.ORG_UNIT])
    dispatch(onSetOrgUnit(otherComponents[URL_COMPONENTS.ORG_UNIT], true));

  if (otherComponents[URL_COMPONENTS.MEASURE])
    dispatch(
      onSetMeasure(
        otherComponents[URL_COMPONENTS.MEASURE],
        otherComponents[URL_COMPONENTS.ORG_UNIT],
      ),
    );

  if (otherComponents[URL_COMPONENTS.REPORT]) {
    dispatch(onOpenEnlargedDialog(null, null, otherComponents[URL_COMPONENTS.REPORT]));
    //dispatch(setEnlargedDashboardDateRange());
  }
};

export const historyMiddleware = state => next => action => {
  const { dispatch } = state;
  const oldLocation = state.getState().routing;
  let newLocation = oldLocation;
  switch (action.type) {
    // Actions that modify the path
    case SET_PROJECT:
      newLocation = setUrlComponent(URL_COMPONENTS.PROJECT, action.projectCode, newLocation);
      dispatch(doUpdateUrl(newLocation));
      dispatch(onSetProject(action.projectCode));
      break;
    case SET_ORG_UNIT:
      newLocation = setUrlComponent(
        URL_COMPONENTS.ORG_UNIT,
        action.organisationUnitCode,
        newLocation,
      );
      dispatch(doUpdateUrl(newLocation));
      dispatch(onSetOrgUnit(action.organisationUnitCode, action.shouldChangeMapBounds));
      break;
    case CHANGE_DASHBOARD_GROUP:
      newLocation = setUrlComponent(URL_COMPONENTS.DASHBOARD, action.name, newLocation);
      dispatch(doUpdateUrl(newLocation));
      break;
    case GO_HOME:
      newLocation = clearUrl();
      dispatch(doUpdateUrl(newLocation));
      dispatch(onSetProject(null));
      break;

    // Actions that modify search params
    case SET_ENLARGED_REPORT:
      newLocation = setUrlComponent(URL_COMPONENTS.REPORT, action.viewContent.viewId, newLocation);
      dispatch(doUpdateUrl(newLocation));
      dispatch(
        onOpenEnlargedDialog(action.viewContent, action.organisationUnitName, action.viewId),
      );
      break;
    case CLOSE_ENLARGED_REPORT:
      newLocation = setUrlComponent(URL_COMPONENTS.REPORT, null, newLocation);
      dispatch(doUpdateUrl(newLocation));
      break;
    case SET_MEASURE:
      newLocation = setUrlComponent(URL_COMPONENTS.MEASURE, action.measureId, newLocation);
      console.log('alkd;jwegawrghnwarighweoifj', action);
      dispatch(doUpdateUrl(newLocation));
      dispatch(onSetMeasure(action.measureId, action.organisationUnitCode));
      break;
    case CLEAR_MEASURE:
      newLocation = setUrlComponent(URL_COMPONENTS.MEASURE, null, newLocation);
      console.log('HEOOOOOOOOOOOOOOOOOOOO');
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
    const currentLocation = getCurrentLocation();
    const { pathname, search } = store.getState().routing;
    if (currentLocation.pathname !== pathname || currentLocation.search !== search) {
      pushHistory(pathname, search);
    }
  });
};
