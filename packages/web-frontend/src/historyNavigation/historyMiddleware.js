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
  OPEN_ENLARGED_DIALOG,
  CLOSE_ENLARGED_DIALOG,
  CHANGE_MEASURE,
  CLEAR_MEASURE,
  GO_HOME,
  onSetOrgUnit,
  setOverlayComponent,
  doUpdateUrl,
} from '../actions';

import { onSetProject } from '../projects/actions';

import { setUrlComponent, getCurrentUrlComponents, clearUrl } from './historyNavigation';
import { URL_COMPONENTS } from './constants';

// TODO: import { gaPageView } from '../utils';
export const reactToInitialState = ({ dispatch }) => {
  const { userPage, ...otherComponents } = getCurrentUrlComponents();
  console.log(otherComponents);

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

  console.log(action, newLocation.pathname, oldLocation.pathname);
  return next(action);
};

export const initHistoryDispatcher = store => {
  // Update Redux if we navigated via browser's back/forward
  // most browsers restore scroll position automatically
  // as long as we make content scrolling happen on document.body
  window.addEventListener('popstate', () => {
    // here `doUpdateUrl` is an action creator that
    // takes the new url and stores it in Redux.
    store.dispatch(doUpdateUrl(window.location.pathname));
  });

  // The other part of the two-way binding is updating the displayed
  // URL in the browser if we change it inside our app state in Redux.
  // We can simply subscribe to Redux and update it if it's different.
  store.subscribe(() => {
    const { pathname } = store.getState().routing;
    if (location.pathname !== pathname) {
      console.log(pathname, location.pathname);
      window.history.pushState(null, '', pathname);
      // Force scroll to top this is what browsers normally do when
      // navigating by clicking a link.
      // Without this, scroll stays wherever it was which can be quite odd.
      document.body.scrollTop = 0;
    }
  });
};
