/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';

const InputGroupWrapper = styled.section``;
const InputGroupHeading = styled.h2`
  padding-inline-start: 0;
  margin: 0;
  font-weight: ${props => props.theme.typography.fontWeightMedium};
  font-size: 1.2rem;
  line-height: 1.4;
`;
const FieldsWrapper = styled.div`
  margin-left: 2rem;
  margin-bottom: 1.2rem;
  ${InputGroupWrapper}:not(:last-child) & {
    border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
  }
`;

const InputGroupHelperText = styled.p`
  font-size: 0.9375rem;
  margin: 0;
  line-height: 1.2;
`;

const InputGroupHeaderWrapper = styled.div`
  margin-bottom: 1rem;
`;

interface InputGroupProps {
  title?: string;
  description?: string;
  fields: React.ReactNode;
}

export const InputGroup = ({ title, description, fields }: InputGroupProps) => {
  return (
    <InputGroupWrapper>
      <InputGroupHeaderWrapper>
        {title && <InputGroupHeading>{title}</InputGroupHeading>}
        {description && <InputGroupHelperText>{description}</InputGroupHelperText>}
      </InputGroupHeaderWrapper>
      <FieldsWrapper>{fields}</FieldsWrapper>
    </InputGroupWrapper>
  );
};
