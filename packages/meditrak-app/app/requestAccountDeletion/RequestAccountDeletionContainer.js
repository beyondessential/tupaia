/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { connect } from 'react-redux';

import { RequestAccountDeletionPage } from './RequestAccountDeletionPage';
import { submit } from './actions';

function mapStateToProps(state) {
  const { authentication, rewards, requestAccountDeletion } = state;
  const { isRequestSent, isLoading } = requestAccountDeletion;
  const { emailAddress, name } = authentication;
  const { pigs, coconuts } = rewards;

  return {
    emailAddress,
    name,
    pigs,
    coconuts,
    isRequestSent,
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
