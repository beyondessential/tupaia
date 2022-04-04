/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';

const StyledDataTypeTabs = styled.div`
  &.has-multiple {
    display: flex;
    align-items: center;
    min-height: 50px;
    padding: 15px;
    gap: 20px;
  }
  &:not(.has-multiple) {
    padding-top: 20px;
  }
`;

const DataTypeTab = styled.a`
  &:not(.selected) {
    cursor: pointer;
  }
  &.selected {
    color: #418bbd;
  }
`;

export const DataTypeTabs = ({ dataTypes, dataType, onChange }) => (
  <StyledDataTypeTabs className={dataTypes.length > 1 ? 'has-multiple' : ''}>
    {dataTypes.length > 1 &&
      dataTypes.map((d, index) => (
        <DataTypeTab
          key={index}
          onClick={event => onChange(event, d)}
          className={d === dataType ? 'selected' : ''}
        >
          {d}
        </DataTypeTab>
      ))}
  </StyledDataTypeTabs>
);
