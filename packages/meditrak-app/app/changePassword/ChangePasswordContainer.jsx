import { connect } from 'react-redux';
import { ChangePasswordPage } from './ChangePasswordPage';
import { changeField, submit } from './actions';

function mapStateToProps({ changePassword }) {
  const { errorMessage, invalidFields, isLoading, newPassword, newPasswordConfirm, oldPassword } =
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
