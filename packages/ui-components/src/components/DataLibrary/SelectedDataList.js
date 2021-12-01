/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { SelectedDataCard } from './options';
import styled from 'styled-components';
import React from 'react';

const StyledSelectedDataList = styled.div`
  padding-top: 10px;
`;

export const SelectedDataList = ({ value, onRemove }) => (
  <StyledSelectedDataList>
    {value.map((option, index) => {
      return <SelectedDataCard key={index} option={option} onRemove={onRemove} />;
    })}
  </StyledSelectedDataList>
);
