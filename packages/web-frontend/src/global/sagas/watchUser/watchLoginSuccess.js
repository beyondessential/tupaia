import { call, put, select, takeLatest } from 'redux-saga/effects';
import { FETCH_LOGIN_SUCCESS, setOverlayComponent } from '../../../actions';
import { LOGIN_TYPES } from '../../../constants';
import { LANDING } from '../../../containers/OverlayDiv/constants';
import { decodeLocation } from '../../../historyNavigation/utils';
import { fetchProjectData } from '../../../projects/sagas';
import { handleLocationChange } from '../handlers';

function* fetchLoginData(action) {
  if (action.loginType === LOGIN_TYPES.MANUAL) {
    const { routing: location } = yield select();
    const { PROJECT, ORG_UNIT } = decodeLocation(location);

    const overlay = PROJECT === 'explore' && ORG_UNIT === 'explore' ? LANDING : null;

    yield put(setOverlayComponent(overlay));
    yield call(fetchProjectData);
    yield call(handleLocationChange, {
      location,
      // Assume an empty location string so that the url will trigger fetching fresh data
      previousLocation: {
        pathname: '',
        search: '',
        hash: '',
      },
    });
  }
}

export function* watchLoginSuccess() {
  yield takeLatest(FETCH_LOGIN_SUCCESS, fetchLoginData);
}
