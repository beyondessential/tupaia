import { Typography } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const Wrapper = styled.div`
  width: auto;
  .MuiFormControl-root {
    // override the default margin-bottom from ui-components
    margin-bottom: 0;
  }
`;
const MessageWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-block-start: 0.2rem;
  height: 1.5rem;
`;

const MessageTextWrapper = styled.div`
  width: 100%;
`;

const HelperTextWrapper = styled(MessageTextWrapper)`
  max-width: 75%;
  margin-inline-start: 0.5rem;
  text-align: right;
`;

const Message = styled(Typography)`
  font-size: 0.75rem;
`;

export const InputWrapper = ({ errorText, helperText, children }) => (
  <Wrapper>
    {children}
    <MessageWrapper>
      {errorText && (
        <MessageTextWrapper>
          <Message color="error">{errorText}</Message>
        </MessageTextWrapper>
      )}
      {helperText && (
        <HelperTextWrapper>
          <Message color="textSecondary">{helperText}</Message>
        </HelperTextWrapper>
      )}
    </MessageWrapper>
  </Wrapper>
);

InputWrapper.propTypes = {
  errorText: PropTypes.string,
  helperText: PropTypes.string,
  children: PropTypes.node.isRequired,
};

InputWrapper.defaultProps = {
  errorText: null,
  helperText: null,
};
