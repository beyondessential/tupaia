/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import {
  ATTEMPT_LOGOUT,
  ATTEMPT_LOGIN,
  FETCH_LOGIN_SUCCESS,
  CHANGE_ORG_UNIT,
  HIGHLIGHT_ORG_UNIT,
  CHANGE_MEASURE,
  CHANGE_TILE_SET,
  TOGGLE_INFO_PANEL,
  SET_OVERLAY_COMPONENT,
  CHANGE_DASHBOARD_GROUP,
  CHANGE_SEARCH,
  TOGGLE_MEASURE_EXPAND,
  TOGGLE_SEARCH_EXPAND,
  GO_HOME,
  CLOSE_DROPDOWN_OVERLAYS,
  OPEN_USER_DIALOG,
  CLOSE_USER_DIALOG,
} from '../actions';
import { initialOrgUnit } from '../defaults';

const ga = window.ga || (() => {});

if (!ga) {
  console.warn('Google Analytics library not found');
}

export const gaEvent = (category, action, label) => ga('send', 'event', category, action, label);

export const gaPageView = pagePath => ga('send', 'pageview', pagePath);

export const gaMiddleware = ({ getState, dispatch }) => next => action => {
  try {
    switch (action.type) {
      case ATTEMPT_LOGIN:
        gaEvent('User', 'Log in', 'Attempt');
        break;

      case FETCH_LOGIN_SUCCESS:
        gaEvent('User', 'Log in', 'Success');
        break;

      case ATTEMPT_LOGOUT:
        gaEvent('User', 'Log out');
        break;

      case CHANGE_ORG_UNIT:
        if (action.organisationUnitCode !== initialOrgUnit.organisationUnitCode) {
          gaEvent('Organisation Unit', 'Change', action.organisationUnitCode);
        }
        break;

      case HIGHLIGHT_ORG_UNIT:
        gaEvent('Organisation Unit', 'Highlight', action.organisationUnit.organisationUnitCode);
        break;

      case CHANGE_MEASURE:
        gaEvent('Measure', 'Change', action.measureId);
        break;

      case CHANGE_TILE_SET:
        gaEvent('Map', 'Change Tile Set', action.setKey);
        break;

      case OPEN_USER_DIALOG:
        gaEvent('User', 'Open Dialog', action.dialogPage);
        break;

      case CLOSE_USER_DIALOG:
        gaEvent('User', 'Close Dialog');
        break;

      case TOGGLE_INFO_PANEL:
        gaEvent('Pages', 'Toggle Info Panel');
        break;

      case SET_OVERLAY_COMPONENT:
        gaEvent('Pages', 'Open Overlay Component', action.component);
        break;

      case CHANGE_DASHBOARD_GROUP:
        gaEvent('Dashboard', 'Change Tab', action.name);
        break;

      case CHANGE_SEARCH:
        gaEvent('Search', 'Change Search');
        break;

      case TOGGLE_MEASURE_EXPAND:
        gaEvent('Measure', 'Toggle Expand');
        break;

      case TOGGLE_SEARCH_EXPAND:
        gaEvent('Search', 'Toggle Expand');
        break;

      case GO_HOME:
        gaEvent('Navigate', 'Go Home');
        break;

      case CLOSE_DROPDOWN_OVERLAYS:
        gaEvent('Overlay', 'Close');
        break;

      default:
        break;
    }
  } catch (error) {
    gaEvent('Error', error.message);
  } finally {
    // Continue the redux chain, the entire app will not function without returning this.
    return next(action);
  }
};

export default ga;
