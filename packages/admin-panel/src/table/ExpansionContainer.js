/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: relative;
  padding: 0 20px 20px;

  .ReactTable {
    margin-top: 12px;
    margin-bottom: 12px;
    z-index: 1;
  }

  .rt-thead.-header {
    border-top: none;
    border-left: none;
    border-right: none;
  }

  .rt-tr {
    padding-right: 5px;
  }
`;

const SHADOW = 'rgba(0, 0, 0, 0.2)';

const Top = styled.div`
  position: absolute;
  top: -72px;
  left: 0;
  right: 0;
  height: 8px;
  box-shadow: 0 -6px 10px ${SHADOW};
`;

const Bottom = styled(Top)`
  top: auto;
  bottom: 0;
  box-shadow: 0 6px 10px ${SHADOW};
`;

const Left = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  top: -72px;
  width: 8px;
  content: '';
  box-shadow: -6px 0 10px ${SHADOW};
`;

const Right = styled(Left)`
  right: 0;
  left: auto;
  content: '';
  box-shadow: 6px 0 10px ${SHADOW};
`;

export const ExpansionContainer = ({ children }) => {
  return (
    <Container>
      <Top />
      <Left />
      <Right />
      {children}
      <Bottom />
    </Container>
  );
};
