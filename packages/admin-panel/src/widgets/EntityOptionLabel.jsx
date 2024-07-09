/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';

const StyledEntityOptionLabel = styled.div`
  display: flex;
  flex-direction: column;
`;

const Name = styled.span`
  font-style: bold;
  color: ${props => props.theme.palette.text.primary};
`;

const Code = styled.span`
  margin-top: 4px; 
  color: ${props => props.theme.palette.text.secondary}; 
`;

export const EntityOptionLabel = ({ name, code }) => {
  return (
    <StyledEntityOptionLabel>
      <Name>{name}</Name>
      <Code>{code}</Code>
    </StyledEntityOptionLabel>
  );
};