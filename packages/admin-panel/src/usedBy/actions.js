import { USED_BY_FETCH_BEGIN, USED_BY_FETCH_ERROR, USED_BY_FETCH_SUCCESS } from './constants';
import { getDataSourceUsedBy, getQuestionUsedBy } from './api';

const RECORD_TYPE_USED_BY_FN = {
  dataElement: async (api, recordId) => getDataSourceUsedBy(api, 'dataElement', recordId),
  dataGroup: async (api, recordId) => getDataSourceUsedBy(api, 'dataGroup', recordId),
  question: getQuestionUsedBy,
  dataTable: async (api, recordId) => getDataSourceUsedBy(api, 'dataTable', recordId),
};

export const fetchUsedBy =
  (recordType, recordId) =>
  async (dispatch, getState, { api }) => {
    dispatch({
      type: USED_BY_FETCH_BEGIN,
    });

    const getUsedBy = RECORD_TYPE_USED_BY_FN[recordType] ?? null;
    if (!getUsedBy) throw new Error(`Unsupported record type: ‘${recordType}’`);

    try {
      const usedBy = await getUsedBy(api, recordId);
      dispatch({
        type: USED_BY_FETCH_SUCCESS,
        recordId,
        usedBy,
      });
    } catch (error) {
      dispatch({
        type: USED_BY_FETCH_ERROR,
        errorMessage: error.message,
      });
    }
  };
