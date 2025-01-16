import { makeSubstitutionsInString } from '../utilities';
import {
  LOGS_DATA_FETCH_BEGIN,
  LOGS_DATA_FETCH_SUCCESS,
  LOGS_DISMISS,
  LOGS_ERROR,
  LOGS_OPEN,
} from './constants';

const getModalTitle = (titleTemplate, recordData) =>
  titleTemplate ? makeSubstitutionsInString(titleTemplate, recordData) : null;

const addQueryParameters = (url, logsPerPage, page) =>
  `${url}?limit=${logsPerPage}${page !== undefined ? `&offset=${page * logsPerPage}` : ''}`;

const fetchNewPageOfLogs = async (dispatch, api, logsEndpoint, page, logsPerPage, recordData) => {
  const formattedLogsEndpoint = makeSubstitutionsInString(logsEndpoint, recordData);
  const finalLogsEndpoint = addQueryParameters(formattedLogsEndpoint, logsPerPage, page);
  dispatch({
    type: LOGS_DATA_FETCH_BEGIN,
  });

  try {
    const response = await api.get(finalLogsEndpoint);
    dispatch({
      type: LOGS_DATA_FETCH_SUCCESS,
      data: response.body,
      page,
    });
  } catch (error) {
    dispatch({
      type: LOGS_ERROR,
      errorMessage: error.message,
    });
  }
};

const fetchLogsFirstTime = async (
  dispatch,
  api,
  logsCountEndpoint,
  logsEndpoint,
  logsPerPage,
  recordData,
) => {
  const finalLogsCountEndpoint = makeSubstitutionsInString(logsCountEndpoint, recordData);
  const formattedLogsEndpoint = makeSubstitutionsInString(logsEndpoint, recordData);
  const finalLogsEndpoint = addQueryParameters(formattedLogsEndpoint, logsPerPage);
  dispatch({
    type: LOGS_DATA_FETCH_BEGIN,
  });

  try {
    const countResponse = await api.get(finalLogsCountEndpoint);
    const logsResponse = await api.get(finalLogsEndpoint);
    dispatch({
      type: LOGS_DATA_FETCH_SUCCESS,
      data: { ...countResponse.body, ...logsResponse.body },
    });
  } catch (error) {
    dispatch({
      type: LOGS_ERROR,
      errorMessage: error.message,
    });
  }
};

export const openLogsModal =
  ({ logsEndpoint, logsCountEndpoint, logsPerPage, title }, recordId, recordData) =>
  async (dispatch, getState, { api }) => {
    await fetchLogsFirstTime(
      dispatch,
      api,
      logsCountEndpoint,
      logsEndpoint,
      logsPerPage,
      recordData,
    );
    dispatch({
      type: LOGS_OPEN,
      recordData,
      recordId,
      logsEndpoint,
      logsCountEndpoint,
      logsPerPage,
      title: getModalTitle(title, recordData),
    });
  };

export const changeLogsTablePage =
  page =>
  async (dispatch, getState, { api }) => {
    const { logsEndpoint, logsPerPage, recordData } = getState().logs;
    await fetchNewPageOfLogs(dispatch, api, logsEndpoint, page, logsPerPage, recordData);
  };

export const closeLogsModal = () => ({
  type: LOGS_DISMISS,
});
