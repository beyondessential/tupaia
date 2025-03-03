import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { SmallAlert } from '@tupaia/ui-components';

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  backdrop-filter: blur(2px);
  background: rgba(0, 0, 0, 0.3);
`;

const Heading = styled.p`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
  margin-top: 0;
`;

const StyledAlert = styled(SmallAlert)`
  position: absolute;
  max-width: 350px;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;

  &.MuiAlert-filledWarning {
    background-color: white;
    color: #333;
    border: 1px solid #ccc;
  }
`;

export const ComingSoon = ({ text }) => (
  <Container>
    <StyledAlert severity="warning">
      <Heading>Under Construction</Heading>
      {text}
    </StyledAlert>
  </Container>
);

ComingSoon.propTypes = {
  text: PropTypes.string,
};

ComingSoon.defaultProps = {
  text: null,
};
