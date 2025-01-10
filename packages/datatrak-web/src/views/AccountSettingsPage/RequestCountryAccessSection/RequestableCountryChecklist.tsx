/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { Checkbox } from '@tupaia/ui-components';
import { Entity, Project, ProjectCountryAccessListRequest } from '@tupaia/types';
import { theme } from '../../../theme';

const Container = styled.fieldset`
  border-radius: 0.1875rem;
  border: 1px solid ${theme.palette.grey[400]};
  block-size: 100%;
  overflow-y: auto; /* fallback */
  overflow-block: auto;
  padding-inline: 0.87rem;

  // Prevent overbearingly tall list on mobile (where parent gridlines are not used to limit height)
  ${({ theme }) => theme.breakpoints.down('sm')} {
    margin-bottom: 1rem;
    border: none;
  }

  // Match styling of ui-components TextField
  :disabled {
    color: ${theme.palette.text.secondary};
    background-color: ${theme.palette.grey['100']};
  }
`;

const StyledCheckbox = styled(Checkbox).attrs({ color: 'primary' })`
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
  projectCode?: Project['code'];
  countries?: ProjectCountryAccessListRequest.ResBody;
  selectedCountries: Entity['id'][];
  setSelectedCountries: React.Dispatch<React.SetStateAction<Entity['id'][]>>;
  disabled?: boolean;
}

export const RequestableCountryChecklist = ({
  projectCode,
  countries = [],
  selectedCountries,
  setSelectedCountries,
  disabled,
}: RequestableCountryChecklistProps) => {
  const { register } = useFormContext();

  const selectCountry = (id: Entity['id'], select = true) =>
    setSelectedCountries(
      select ? selectedCountries.concat([id]) : selectedCountries.filter(element => element !== id),
    );

  const getTooltip = (hasAccess: boolean, hasPendingAccess: boolean) => {
    if (hasAccess) return 'You already have access';
    if (hasPendingAccess) return 'Approval in progress';
  };

  return (
    <Container disabled={disabled}>
      {!projectCode
        ? null
        : countries.map(({ id, name, hasAccess, hasPendingAccess }) => {
            const isSelected = selectedCountries.includes(id);
            const tooltip = getTooltip(hasAccess, hasPendingAccess);

            return (
              <StyledCheckbox
                checked={isSelected}
                disabled={hasAccess || hasPendingAccess}
                id="entityIds"
                inputRef={register({ validate: (value: Entity['id'][]) => value.length > 0 })}
                key={id}
                label={name}
                name="entityIds"
                onChange={() => selectCountry(id, !isSelected)}
                tooltip={tooltip}
                value={id}
              />
            );
          })}
    </Container>
  );
};
