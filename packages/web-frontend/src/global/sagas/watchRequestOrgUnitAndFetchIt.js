import { select, takeEvery } from 'redux-saga/effects';
import { REQUEST_ORG_UNIT } from '../../actions';
import { selectCurrentProjectCode, selectOrgUnit } from '../../selectors';
import { fetchOrgUnitData } from './handlers';

function* fetchOrgUnit(action) {
  const state = yield select();
  const activeProjectCode = selectCurrentProjectCode(state);
  const { organisationUnitCode = activeProjectCode } = action;
  const orgUnit = selectOrgUnit(state, organisationUnitCode);
  if (orgUnit && orgUnit.isComplete) {
    return; // If we already have the complete org unit in reduxStore, just exit early
  }

  yield fetchOrgUnitData(organisationUnitCode, activeProjectCode);
}

export function* watchRequestOrgUnitAndFetchIt() {
  yield takeEvery(REQUEST_ORG_UNIT, fetchOrgUnit);
}
