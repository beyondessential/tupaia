/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useFormContext } from 'react-hook-form';
import { Checkbox } from '@tupaia/ui-components';
import { Entity, Project, TupaiaWebCountryAccessListRequest } from '@tupaia/types';
import { theme } from '../../../theme';

const Container = styled.fieldset`
  margin: 0;
  padding-block: 0;

  border-radius: 0.1875rem;
  border: 1px solid ${theme.palette.grey[400]};
  block-size: 100%;
  overflow-y: scroll; /* fallback */
  overflow-block: scroll;
  padding-inline: 0.87rem;

  // Match styling of ui-components TextField
  :disabled {
    color: ${theme.palette.text.secondary};
    background-color: ${theme.palette.grey['100']};
  }
`;

const StyledCheckbox = styled(Checkbox)`
  margin-block: 0;

  .MuiFormControlLabel-root {
    inline-size: 100%;
  }

  .MuiFormControlLabel-label {
    font-size: 0.875rem;
    inline-size: 100%;
    line-height: 1.125rem;
  }
`;

interface RequestableCountryChecklistProps {
  countries: TupaiaWebCountryAccessListRequest.ResBody[];
  disabled?: boolean;
  projectCode: Project['code'];
}

export const RequestableCountryChecklist = ({
  countries,
  disabled,
  projectCode,
}: RequestableCountryChecklistProps) => {
  const { register } = useFormContext();

  function getTooltip(hasAccess: boolean, hasRequestedAccess: boolean) {
    if (hasAccess) return 'You already have access';
    if (hasRequestedAccess) return 'Approval in progress';
  }

  return (
    <Container disabled={disabled}>
      {countries.map(({ id, name, hasAccess, accessRequests }) => {
        const hasRequestedAccess = accessRequests.includes(projectCode);

        return (
          <StyledCheckbox
            color="primary"
            disabled={hasAccess || hasRequestedAccess}
            id="entityIds"
            inputRef={register({ validate: (value: Entity['id'][]) => value.length > 0 })}
            key={id}
            label={name}
            name="entityIds"
            tooltip={getTooltip(hasAccess, hasRequestedAccess)}
            value={id}
          />
        );
      })}
    </Container>
  );
};
