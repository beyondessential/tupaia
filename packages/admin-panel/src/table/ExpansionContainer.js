/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';

export const ExpansionContainer = styled.div`
  position: relative;
  padding: 0 20px 20px;

  .ReactTable {
    margin-top: 12px;
    margin-bottom: 12px;
  }

  .rt-thead.-header {
    border-top: none;
    border-left: none;
    border-right: none;
  }

  .rt-tr {
    padding-right: 5px;
  }

  &:after {
    position: absolute;
    top: -72px;
    bottom: 0;
    left: 0;
    right: 0;
    content: '';
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
  }
`;