/**
 * Selectors
 * These can be handy tools to allow for components/sagas to interact with the redux state, and fetch data from it.
 * It allows us to define usefully composed aspects of the state, so that clients are not so tightly coupled with the
 * internal structure of state. With the use of memoization, and caching, we are also able to improve the performance
 * of state lookups, and importantly cut down on React re-render calls.
 */

/**
 * Public Selectors
 * The selectors exported below are the ones consumed by components/sagas/everything else. So far it has seemed a good practice to
 * standardise all public selectors to accept the whole `state` as the first parameter. The state is easily accessible
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
  selectCurrentDashboardGroupCode,
  selectCurrentExpandedReportCode,
  selectCurrentDashboardKey,
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
} from './measureSelectors';
