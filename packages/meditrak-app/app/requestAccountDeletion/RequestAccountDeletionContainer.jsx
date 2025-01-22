import { connect } from 'react-redux';

import { RequestAccountDeletionPage } from './RequestAccountDeletionPage';
import { submit } from './actions';
import { database } from '../database';

function mapStateToProps(state) {
  const { authentication, rewards, requestAccountDeletion } = state;
  const { isLoading } = requestAccountDeletion;
  const { emailAddress, name } = authentication;
  const { pigs, coconuts } = rewards;
  const user = database.getUser(emailAddress);
  const { isRequestedAccountDeletion } = user;
  return {
    emailAddress,
    name,
    pigs,
    coconuts,
    isRequestedAccountDeletion,
    isLoading,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onSubmit: () => dispatch(submit()),
  };
}

const RequestAccountDeletionContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(RequestAccountDeletionPage);

export { RequestAccountDeletionContainer };
