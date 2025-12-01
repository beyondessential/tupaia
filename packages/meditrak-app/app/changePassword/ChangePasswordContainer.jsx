import { connect } from 'react-redux';

import { ChangePasswordPage } from './ChangePasswordPage';
import { changeField, submit } from './actions';
import { goBack } from '../navigation';

function mapStateToProps({ changePassword }) {
  const { oldPassword, newPassword, newPasswordConfirm, isLoading, errorMessage, invalidFields } =
    changePassword;

  return {
    formFieldValues: {
      oldPassword,
      newPassword,
      newPasswordConfirm,
    },
    isLoading,
    errorMessage,
    invalidFields,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onChangeField: (fieldName, fieldValue) => {
      dispatch(changeField(fieldName, fieldValue));
    },
    onSubmit: () => dispatch(submit()),
  };
}

const ChangePasswordContainer = connect(mapStateToProps, mapDispatchToProps)(ChangePasswordPage);

export { ChangePasswordContainer };
