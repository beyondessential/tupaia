import React from 'react';
import styled from 'styled-components';
import { Box } from '@material-ui/core';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Form, FormInput, TextField } from '@tupaia/ui-components';
import { Button } from '../../../components';
import { UserAccountDetails } from '../../../types';
import { successToast } from '../../../utils';
import { CurrentUserContextType, useCurrentUserContext, useEditUser } from '../../../api';

interface PersonalDetailsFormFields
  extends Pick<
    UserAccountDetails,
    'firstName' | 'lastName' | 'employer' | 'position' | 'mobileNumber'
  > {}

/**
 * Guarantees right-alignment of button in grid. Necessary because tooltip attribute on the button
 * wraps it in a flexbox, which nullifies the effect of grid-column.
 */
const ButtonWrapper = styled(Box)`
  ${({ theme }) => theme.breakpoints.up('sm')} {
    grid-column: -2 / -1;
  }
`;

const StyledTextField = styled(TextField)`
  margin: 0; // Use gap on parent to control spacing
`;

const StyledForm = styled(Form<PersonalDetailsFormFields>)`
  width: 100%;

  ${({ theme }) => theme.breakpoints.up('md')} {
    max-width: 44.25rem;
  }
`;

const StyledFieldset = styled.fieldset`
  display: grid;
  gap: 1.56rem 1.25rem;

  ${({ theme }) => theme.breakpoints.up('sm')} {
    grid-template-columns: repeat(2, 1fr);
  }

  .MuiFormLabel-root {
    color: ${props => props.theme.palette.text.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  }

  .MuiInputLabel-outlined {
    // Fix labels appearing over hamburger menu drawer (in md and sm size classes)
    z-index: auto;
  }
`;

export const PersonalDetailsForm = () => {
  const user: CurrentUserContextType = useCurrentUserContext();

  const formContext = useForm<PersonalDetailsFormFields>({
    defaultValues: {
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      mobileNumber: user.mobileNumber ?? '',
      employer: user.employer ?? '',
      position: user.position ?? '',
    } as PersonalDetailsFormFields,
    mode: 'onBlur',
  });
  const {
    formState: { dirtyFields, isDirty, isSubmitting, isValid, isValidating },
    getValues,
    handleSubmit,
    reset,
  } = formContext;

  function handleSubmissionSuccess(): void {
    reset(getValues() as PersonalDetailsFormFields);
    successToast('Your personal details have been successfully updated');
  }
  const { isLoading, mutate: updateUser } = useEditUser(handleSubmissionSuccess);

  const formIsNotSubmissible = !isDirty || isValidating || !isValid || isSubmitting || isLoading;

  function onSubmit(
    userDetails: PersonalDetailsFormFields,
  ): SubmitHandler<PersonalDetailsFormFields> {
    const updates: PersonalDetailsFormFields = Object.keys(dirtyFields)
      // Keep only user-modified fields...
      .filter(field => dirtyFields[field])
      // ...and trim them
      .reduce(
        (updatedFields, field) => ({ ...updatedFields, [field]: userDetails[field].trim() }),
        {} as PersonalDetailsFormFields,
      );

    updateUser(updates as UserAccountDetails);
  }

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)} formContext={formContext}>
      <StyledFieldset disabled={isSubmitting || isLoading}>
        <FormInput
          autoComplete="given-name"
          id="firstName"
          Input={StyledTextField}
          inputProps={{ enterKeyHint: 'next' }}
          label="First name"
          name="firstName"
          placeholder="First name"
          required
        />
        <FormInput
          autoComplete="family-name"
          id="lastName"
          Input={StyledTextField}
          inputProps={{ enterKeyHint: 'next' }}
          label="Last name"
          name="lastName"
          placeholder="Last name"
          required
        />
        <StyledTextField
          autoComplete="email"
          disabled
          id="email"
          inputProps={{ enterKeyHint: 'next', inputMode: 'email' }}
          label="Email"
          name="email"
          placeholder="Email"
          required
          tooltip="You cannot change your email address"
          type="email"
          value={user.email}
        />
        <FormInput
          autoComplete="tel"
          id="mobileNumber"
          Input={StyledTextField}
          inputProps={{ enterKeyHint: 'next', inputMode: 'tel' }}
          label="Contact number (optional)"
          name="mobileNumber"
          placeholder="Contact number"
          type="tel"
        />
        <FormInput
          autoComplete="organization"
          id="employer"
          Input={StyledTextField}
          inputProps={{ enterKeyHint: 'next' }}
          label="Employer"
          name="employer"
          placeholder="Employer"
          required
        />
        <FormInput
          autoComplete="organization-title"
          id="position"
          Input={StyledTextField}
          inputProps={{ enterKeyHint: 'done' }}
          label="Position"
          name="position"
          placeholder="Position"
          required
        />
        <ButtonWrapper>
          <Button
            type="submit"
            tooltip={isDirty ? null : 'Change details to save changes'}
            tooltipDelay={0}
            disabled={formIsNotSubmissible}
            fullWidth
          >
            {isSubmitting || isLoading ? 'Saving' : 'Save changes'}
          </Button>
        </ButtonWrapper>
      </StyledFieldset>
    </StyledForm>
  );
};
