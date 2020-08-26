/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * Selectors
 * These can be handy tools to allow for components/sagas to interact with the redux state, and fetch data from it.
 * It allows us to define usefully composed aspects of the state, so that clients are not so tightly coupled with the
 * internal structure of state. With the use of memoization, and caching, we are also able to improve the performance
 * of state lookups, and importantly cut down on React re-render calls.
 */

/**
 * Public Selectors
 * The selectors exported below are the ones consumed by components/sagas/everything else.
 *
 * All selectors accept the whole `state` as the first parameter. The state is easily accessible
 * from mapStateToProps in components, and via `yield select()` in sagas.
 */

export {
  selectCurrentOrgUnitCode,
  selectOrgUnit,
  selectOrgUnitCountry,
  selectCurrentOrgUnit,
  selectOrgUnitChildren,
  selectOrgUnitSiblings,
} from './orgUnitSelectors';

export {
  selectCurrentProjectCode,
  selectCurrentProject,
  selectIsProject,
  selectProjectByCode,
  selectAdjustedProjectBounds,
} from './projectSelectors';

export {
  selectCurrentInfoViewKey,
  selectIsDashboardGroupCodeDefined,
  selectCurrentDashboardGroupCode,
  selectCurrentExpandedViewContent,
  selectCurrentExpandedViewId,
} from './dashboardSelectors';

export {
  selectCurrentMeasure,
  selectHasPolygonMeasure,
  selectAllMeasuresWithDisplayInfo,
  selectAllMeasuresWithDisplayAndOrgUnitData,
  selectRenderedMeasuresWithDisplayInfo,
  selectRadiusScaleFactor,
  selectMeasureBarItemById,
  selectCurrentMeasureId,
  selectMeasureBarItemCategoryById,
} from './measureSelectors';
