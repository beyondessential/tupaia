import React from 'react';
import styled from 'styled-components';

const FieldsWrapper = styled.div`
  margin-left: 2rem;
  margin-bottom: 1.2rem;
`;

const InputGroupWrapper = styled.section`
  &:not(:last-child) > ${FieldsWrapper} {
    border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
  }
`;
const InputGroupHeading = styled.h2`
  padding-inline-start: 0;
  margin: 0;
  font-weight: ${props => props.theme.typography.fontWeightMedium};
  font-size: 1.2rem;
  line-height: 1.4;
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
  WrapperComponent?: React.ElementType;
}

export const InputGroup = ({
  title,
  description,
  fields,
  WrapperComponent = InputGroupWrapper,
}: InputGroupProps) => {
  return (
    <WrapperComponent>
      {title ||
        (description && (
          <InputGroupHeaderWrapper>
            {title && <InputGroupHeading>{title}</InputGroupHeading>}
            {description && <InputGroupHelperText>{description}</InputGroupHelperText>}
          </InputGroupHeaderWrapper>
        ))}
      <FieldsWrapper>{fields}</FieldsWrapper>
    </WrapperComponent>
  );
};
