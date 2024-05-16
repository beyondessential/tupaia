/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Typography } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const Wrapper = styled.div`
  .MuiFormControl-root {
    // override the default margin-bottom from ui-components
    margin-bottom: 0;
  }
  margin-bottom: 1.2rem;
`;
const MessageWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-block-start: 0.2rem;
`;

const MessageTextWrapper = styled.div``;

const Message = styled(Typography)`
  font-size: 0.75rem;
`;

export const InputWrapper = ({ errorText, helperText, children }) => (
  <Wrapper>
    {children}
    {(errorText || helperText) && (
      <MessageWrapper>
        <MessageTextWrapper>
          {errorText && <Message color="error">{errorText}</Message>}
        </MessageTextWrapper>
        <MessageTextWrapper>
          {helperText && <Message color="textSecondary">{helperText}</Message>}
        </MessageTextWrapper>
      </MessageWrapper>
    )}
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
