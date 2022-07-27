import queryString from 'query-string';
import { call, put } from 'redux-saga/effects';
import { fetchOrgUnit, fetchOrgUnitError, fetchOrgUnitSuccess } from '../../actions';
import { request } from '../../utils';

/**
 * fetchOrgUnitData
 *
 * Fetch an org unit.
 *
 */
export function* fetchOrgUnitData(organisationUnitCode, projectCode) {
  try {
    yield put(fetchOrgUnit(organisationUnitCode));
    // Build the request url
    const urlParameters = {
      organisationUnitCode,
      projectCode,
      includeCountryData: organisationUnitCode !== projectCode, // We should pull in all country data if we are within a project
    };
    const requestResourceUrl = `organisationUnit?${queryString.stringify(urlParameters)}`;
    const orgUnitData = yield call(request, requestResourceUrl);
    yield put(fetchOrgUnitSuccess(orgUnitData));
    return orgUnitData;
  } catch (error) {
    if (error.errorFunction) {
      yield put(error.errorFunction(error));
    }
    yield put(fetchOrgUnitError(organisationUnitCode, error.message));

    throw error;
  }
}
