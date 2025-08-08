import { DEFAULT_TABLE_STATE } from './constants';

export const getTableState = (state, reduxId) => state.tables[reduxId] || DEFAULT_TABLE_STATE;

export const getIsFetchingData = (state, reduxId) => !!getTableState(state, reduxId).fetchId;
export const getFetchId = tableState => tableState.fetchId;
