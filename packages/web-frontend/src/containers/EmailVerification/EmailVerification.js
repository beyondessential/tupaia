import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { isMobile } from '../../utils';
import { FormWrapper } from '../../components/FormWrapper';
import { Form } from '../Form';
import { TextField } from '../Form/Fields';
import { emailAddress } from '../Form/validators';
import { SubmitButton } from '../Form/common/SubmitButton';
import { resendVerificationEmail } from '../../actions';

const CheckEmailMessage = styled.p`
  text-align: center;
  color: ${isMobile() && '#fff'};
  padding: 0 15px;
`;

export const EmailVerificationComponent = ({
  onResendEmail,
  hasSentEmail,
  messageFailEmailVerify,
  currentUserEmail
}) => {
  const titleText = 'Sign in to Tupaia';

  return hasSentEmail ? (
    <CheckEmailMessage>
      Please check your email for further instructions on how to verify your account.
    </CheckEmailMessage>
  ) : (
    <FormWrapper titleText={titleText}>
      <div>
        <Form
          formError={messageFailEmailVerify}
          onSubmit={email => onResendEmail(email)}
          render={submitForm => (
            <>
              <TextField
                fullWidth
                label="E-mail"
                name="email"
                defaultValue={currentUserEmail}
                validators={[emailAddress]}
                required
              />
              <SubmitButton handleClick={submitForm} gutterTop>
                Re-send Email
              </SubmitButton>
            </>
          )}
        />
      </div>
    </FormWrapper>
  );
};

EmailVerificationComponent.propTypes = {
  onResendEmail: PropTypes.func.isRequired,
  hasSentEmail: PropTypes.bool.isRequired,
  messageFailEmailVerify: PropTypes.string.isRequired,
  currentUserEmail: PropTypes.string
};

EmailVerificationComponent.defaultProps = {
  currentUserEmail: null
}

const mapStateToProps = state => {
  const { hasSentEmail, messageFailEmailVerify, currentUserEmail } = state.authentication;

  return {
    hasSentEmail,
    messageFailEmailVerify,
    currentUserEmail
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onResendEmail: ({ email }) => dispatch(resendVerificationEmail(email)),
  };
};

export const EmailVerification = connect(
  mapStateToProps,
  mapDispatchToProps,
)(EmailVerificationComponent);
