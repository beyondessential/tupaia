import { connect } from 'react-redux';
import { NavigationActions } from 'react-navigation';
import { NoInternetForgotPasswordPage } from './NoInternetForgotPasswordPage';

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    onBackToLogin: () => dispatch(NavigationActions.back()),
  };
}

const NoInternetForgotPasswordContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NoInternetForgotPasswordPage);

export { NoInternetForgotPasswordContainer };
