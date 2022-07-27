import { put, select, takeLatest } from 'redux-saga/effects';
import { changeOrgUnitError, changeOrgUnitSuccess, SET_ORG_UNIT } from '../../actions';
import { selectCurrentProjectCode, selectOrgUnit, selectOrgUnitChildren } from '../../selectors';
import { fetchOrgUnitData } from './handlers';

const normaliseCountryHierarchyOrgUnitData = orgUnitData => {
  const { countryHierarchy, ...restOfOrgUnit } = orgUnitData;
  if (!countryHierarchy) {
    return orgUnitData;
  }

  const hierarchyOrgUnitItem = countryHierarchy.find(
    hierarchyItem => hierarchyItem.organisationUnitCode === orgUnitData.organisationUnitCode,
  );

  const parent = countryHierarchy.find(
    hierarchyItem => hierarchyItem.organisationUnitCode === hierarchyOrgUnitItem.parent,
  );

  return {
    ...restOfOrgUnit,
    parent,
    organisationUnitChildren: countryHierarchy.filter(
      descendant => descendant.parent === orgUnitData.organisationUnitCode,
    ),
  };
};

function* fetchOrgUnitDataAndChangeOrgUnit(action) {
  const state = yield select();
  const { organisationUnitCode, shouldChangeMapBounds } = action;
  const orgUnit = selectOrgUnit(state, organisationUnitCode);
  if (orgUnit && orgUnit.isComplete) {
    const orgUnitAndChildren = {
      ...orgUnit,
      parent: selectOrgUnit(state, orgUnit.parent) || {},
      organisationUnitChildren: selectOrgUnitChildren(state, organisationUnitCode),
    };
    yield put(changeOrgUnitSuccess(orgUnitAndChildren, shouldChangeMapBounds));
    return; // If we already have the org unit in reduxStore, just exit early
  }

  try {
    const orgUnitData = yield fetchOrgUnitData(
      organisationUnitCode,
      selectCurrentProjectCode(state),
    );
    yield put(
      changeOrgUnitSuccess(
        normaliseCountryHierarchyOrgUnitData(orgUnitData),
        shouldChangeMapBounds,
      ),
    );
  } catch (error) {
    yield put(changeOrgUnitError(error));
  }
}

export function* watchOrgUnitChangeAndFetchIt() {
  yield takeLatest(SET_ORG_UNIT, fetchOrgUnitDataAndChangeOrgUnit);
}
