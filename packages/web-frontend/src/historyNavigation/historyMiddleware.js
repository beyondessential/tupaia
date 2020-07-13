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
} from '../actions';

import { onSetProject } from '../projects/actions';

import { setUrlComponent, clearUrl } from './historyNavigation';
import { URL_COMPONENTS } from './constants';

// TODO: import { gaPageView } from '../utils';

export const historyMiddleware = ({ dispatch }) => next => action => {
  switch (action.type) {
    // Actions that modify the path
    case SET_PROJECT:
      setUrlComponent(URL_COMPONENTS.PROJECT, action.projectCode);
      dispatch(onSetProject(action.projectCode));
      break;
    case SET_ORG_UNIT:
      setUrlComponent(URL_COMPONENTS.ORG_UNIT, action.organisationUnitCode);
      dispatch(onSetOrgUnit(action.organisationUnitCode, action.shouldChangeMapBounds));
      break;
    case CHANGE_DASHBOARD_GROUP:
      setUrlComponent(URL_COMPONENTS.DASHBOARD, action.name);
      break;
    case GO_HOME:
      clearUrl();
      dispatch(onSetProject(null));
      break;

    // Actions that modify search params
    case OPEN_ENLARGED_DIALOG:
      setUrlComponent(URL_COMPONENTS.REPORT, action.viewContent.viewId);
      break;
    case CLOSE_ENLARGED_DIALOG:
      setUrlComponent(URL_COMPONENTS.REPORT, null);
      break;
    case CHANGE_MEASURE:
      setUrlComponent(URL_COMPONENTS.MEASURE, action.measureId);
      break;
    case CLEAR_MEASURE:
      setUrlComponent(URL_COMPONENTS.MEASURE, null);
      break;
    default:
      return next(action);
  }

  return next(action);
};
