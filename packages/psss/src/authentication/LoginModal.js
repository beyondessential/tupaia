/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert, Button, FormGroup, Input, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { changeEmailAddress, changePassword, login } from './actions';
import { getIsLoginModalOpen, getEmailAddress, getPassword, getErrorMessage } from './selectors';

const RETURN_KEY_CHARACTER_CODE = 13;

export const LoginModalComponent = props => {
  const {
    isLoginModalOpen,
    emailAddress,
    password,
    errorMessage,
    onChangeEmailAddress,
    onChangePassword,
    onLogin,
  } = props;
  return (
    <div className={'static-modal'}>
      <Modal isOpen={isLoginModalOpen}>
        <ModalHeader>Login</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Input
              value={emailAddress}
              placeholder={'Email Address'}
              onChange={onChangeEmailAddress}
            />
          </FormGroup>
          <FormGroup>
            <Input
              value={password}
              placeholder={'Password'}
              type={'password'}
              onChange={onChangePassword}
              onKeyPress={target => target.charCode === RETURN_KEY_CHARACTER_CODE && onLogin()}
            />
          </FormGroup>
          {errorMessage && <Alert color={'danger'}>{errorMessage}</Alert>}
          <Button onClick={onLogin}>Login</Button>
        </ModalBody>
      </Modal>
    </div>
  );
};

LoginModalComponent.propTypes = {
  isLoginModalOpen: PropTypes.bool.isRequired,
  emailAddress: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  errorMessage: PropTypes.string,
  onChangeEmailAddress: PropTypes.func.isRequired,
  onChangePassword: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
};

LoginModalComponent.defaultProps = {
  errorMessage: null,
};

const mapStateToProps = state => ({
  isLoginModalOpen: getIsLoginModalOpen(state),
  emailAddress: getEmailAddress(state),
  password: getPassword(state),
  errorMessage: getErrorMessage(state),
});

const mergeProps = (stateProps, { dispatch }, ownProps) => ({
  ...ownProps,
  ...stateProps,
  onChangeEmailAddress: event => dispatch(changeEmailAddress(event.target.value)),
  onChangePassword: event => dispatch(changePassword(event.target.value)),
  onLogin: () => dispatch(login(stateProps.emailAddress, stateProps.password)),
});

export const LoginModal = connect(mapStateToProps, null, mergeProps)(LoginModalComponent);
