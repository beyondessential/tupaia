import React, { FieldsetHTMLAttributes } from 'react';
import { UseFormMethods, useFormContext } from 'react-hook-form';
import styled, { css } from 'styled-components';

import { Entity } from '@tupaia/types';
import { Checkbox } from '@tupaia/ui-components';

import { useCountryAccessList, useCurrentUserContext } from '../../../api';
import { RequestCountryAccessFormFields } from './RequestCountryAccessForm';

const FieldSet = styled.fieldset(props => {
  const { breakpoints, palette } = props.theme;
  return css`
    border: max(0.0625rem, 1px) solid ${palette.grey[400]};
    border-radius: 0.1875rem;
    block-size: 100%;
    padding-inline: 0.87rem;

    overflow-block: auto;
    @supports not (overflow-block: auto) {
      overflow-y: auto;
    }

    // Match styling of ui-components TextField
    &:disabled {
      color: ${palette.text.secondary};
      background-color: ${palette.grey[100]};
    }

    ${breakpoints.down('xs')} {
      margin-block-end: 1rem;
      border: none;
    }
  `;
});

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

const validateField = (value: Entity['id'][]) => value.length > 0;

const getTooltip = (hasAccess: boolean, hasPendingAccess: boolean) => {
  if (hasAccess) return 'You already have access';
  if (hasPendingAccess) return 'Approval in progress';
};

interface RequestableCountryChecklistProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  selectedCountries: Entity['id'][];
  setSelectedCountries: React.Dispatch<React.SetStateAction<Entity['id'][]>>;
}

export const RequestableCountryChecklist = ({
  selectedCountries,
  setSelectedCountries,
  ...fieldsetProps
}: RequestableCountryChecklistProps) => {
  const { project } = useCurrentUserContext();
  const projectCode = project?.code;
  const { data: countries } = useCountryAccessList();

  const { register }: UseFormMethods<RequestCountryAccessFormFields> = useFormContext();

  const toggleCountry = (id: Entity['id'], isSelected: boolean) => {
    return setSelectedCountries(
      isSelected
        ? selectedCountries.filter((element: Entity['id']) => element !== id)
        : selectedCountries.concat(id),
    );
  };

  return (
    <FieldSet {...fieldsetProps}>
      {!projectCode
        ? null
        : countries?.map(({ id, name, hasAccess, hasPendingAccess }) => {
            const isSelected = selectedCountries.includes(id);
            const tooltip = getTooltip(hasAccess, hasPendingAccess);

            return (
              <StyledCheckbox
                checked={isSelected}
                disabled={hasAccess || hasPendingAccess}
                inputRef={register({ validate: validateField })}
                key={id}
                label={name}
                name="entityIds"
                onChange={() => toggleCountry(id, isSelected)}
                tooltip={tooltip}
                value={id}
              />
            );
          })}
    </FieldSet>
  );
};
