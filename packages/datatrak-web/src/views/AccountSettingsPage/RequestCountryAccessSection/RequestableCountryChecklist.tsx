import React from 'react';
import { useFormContext } from 'react-hook-form';
import styled, { css } from 'styled-components';

import { Checkbox } from '@tupaia/ui-components';
import { Entity, Project, ProjectCountryAccessListRequest } from '@tupaia/types';

const Container = styled.fieldset`
  border-radius: 0.1875rem;
  block-size: 100%;
  padding-inline: 0.87rem;

  ${props => {
    const { breakpoints, palette } = props.theme;
    return css`
      border: max(0.0625rem, 1px) solid ${palette.grey[400]};

      // Match styling of ui-components TextField
      :disabled {
        color: ${palette.text.secondary};
        background-color: ${palette.grey[100]};
      }

      ${breakpoints.down('sm')} {
        margin-block-end: 1rem;
        border: none;
      }
    `;
  }}

  overflow-block: auto;
  @supports not (overflow-block: auto) {
    overflow-y: auto;
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
            const validate = (value: Entity['id'][]) => value.length > 0;

            return (
              <StyledCheckbox
                checked={isSelected}
                disabled={hasAccess || hasPendingAccess}
                id="entityIds"
                inputRef={register({ validate })}
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
