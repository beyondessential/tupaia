import {
  DELETE_ACCOUNT_REQUEST,
  DELETE_ACCOUNT_REQUEST_SUCCESS,
  DELETE_ACCOUNT_REQUEST_FAILURE,
} from './constants';

const deleteAccountError = () => ({
  type: DELETE_ACCOUNT_REQUEST_FAILURE,
});

export const submit =
  () =>
  async (dispatch, getState, { api, database }) => {
    dispatch({ type: DELETE_ACCOUNT_REQUEST });
    let response;
    try {
      response = await api.deleteAccountRequest();
      if (response.error) {
        throw new Error(response.error);
      }

      const { authentication } = getState();
      const { currentUserId } = authentication;
      database.updateUser({ id: currentUserId, isRequestedAccountDeletion: true });
    } catch {
      dispatch(deleteAccountError());
      return;
    }

    dispatch({ type: DELETE_ACCOUNT_REQUEST_SUCCESS });
  };
