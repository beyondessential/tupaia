import {
  CHANGE_PASSWORD_REQUEST,
  CHANGE_PASSWORD_FAILURE,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FIELD_CHANGE,
} from './constants';
import { goBack } from '../navigation';
import { addMessage } from '../messages';

export const changeField = (fieldName, fieldValue) => ({
  type: CHANGE_PASSWORD_FIELD_CHANGE,
  fieldName,
  fieldValue,
});

export const changePasswordError = (errorMessage, invalidFields = []) => ({
  type: CHANGE_PASSWORD_FAILURE,
  errorMessage,
  invalidFields,
});

export const submit =
  () =>
  async (dispatch, getState, { api }) => {
    const { changePassword } = getState();
    const { oldPassword, newPassword, newPasswordConfirm } = changePassword;

    if (newPassword !== newPasswordConfirm) {
      dispatch(
        changePasswordError('Confirmed password must match new password.', [
          'newPassword',
          'newPasswordConfirm',
        ]),
      );
      return;
    }

    dispatch({ type: CHANGE_PASSWORD_REQUEST });

    try {
      const response = await api.changeUserPassword(oldPassword, newPassword, newPasswordConfirm);
      if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      dispatch(changePasswordError(error.message));
      return;
    }

    dispatch(addMessage('change_password', 'Your password was successfully updated.'));
    dispatch({ type: CHANGE_PASSWORD_SUCCESS });
    dispatch(goBack());
  };
