import React from 'react';
import styled from 'styled-components';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  DialogActions,
  FormControl as BaseFormControl,
  FormGroup,
  Typography,
} from '@material-ui/core';
import MuiInfoIcon from '@material-ui/icons/InfoOutlined';

import { ProjectCountryAccessListRequest, WebServerProjectRequest } from '@tupaia/types';

import {
  Checkbox as BaseCheckbox,
  SpinningLoader,
  TextField,
  Button,
  Alert,
} from '../../components';
import { Form, FormInput } from '../Form';
import { RequestProjectAccessSuccessMessage } from './RequestProjectAccessSuccessMessage';

const FormControl = styled(BaseFormControl).attrs({
  component: 'fieldset',
  required: true,
})`
  margin-block-end: 2rem;
`;

const Checkbox = styled(BaseCheckbox).attrs({
  color: 'primary',
})`
  margin: 0;

  &,
  .MuiFormControlLabel-label span // When checkbox has a tooltip
  {
    font-size: 0.875rem;
  }

  .MuiSvgIcon-root {
    width: 1.2rem;
    height: 1.2rem;
  }
`;

const TextArea = styled(TextField).attrs({
  label: 'Why would you like access to this project?',
  type: 'text',
  multiline: true,
  rows: 4,
})`
  .MuiFormLabel-root {
    color: ${({ theme }) => theme.palette.text.primary};
    font-size: 0.875rem;
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    margin-block-end: 0.5rem;
  }
  .MuiInputBase-input {
    font-size: 0.875rem;
    padding: 0.875rem;
  }
  .MuiInputBase-root {
    background-color: ${({ theme }) => theme.palette.background.paper};
  }
  // we have to override this here as there are selectors inside ui-components with higher specificity than we can achieve via the theme overrides
  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    box-shadow: none;
    border-color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const LoaderWrapper = styled.div`
  padding: 1rem 0 2rem 0;
`;

/** Fixes janky spacing changes when 'Request access' button is enabled or disabled */
const StyledDialogActions = styled(DialogActions)`
  gap: 1rem;
  padding: 1.5rem 0 0 0;
  & > :not(:first-child) {
    margin-inline-start: 0;
  }
`;

const FormButton = styled(Button)`
  text-transform: none;
  font-size: 0.875rem;
`;

type Country = ProjectCountryAccessListRequest.ResBody[number];

interface ProjectAccessFormProps {
  project?: WebServerProjectRequest.ResBody;
  onBack?: () => void;
  countries: Country[];
  onSubmit: (data: { entityIds: string[]; message: string; projectCode: string }) => void;
  isSubmitting: boolean;
  isSuccess: boolean;
  backButtonText?: string;
  ErrorMessageComponent?: React.ComponentType;
}

const InfoIcon = styled(MuiInfoIcon)`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.palette.primary.main};
  width: 1.5rem;
  height: 1.5rem;
`;

const OfflineErrorMessageContainer = styled.div`
  padding-inline: 1.5rem;
  font-size: 0.875rem;
  align-items: center;
  text-align: center;
  margin-bottom: 2rem;

  .MuiTypography-h2 {
    font-size: 0.9rem;
  }
  .MuiTypography-body1 {
    font-size: 0.9rem;
  }
`;

const OfflineTitle = styled(Typography).attrs({
  variant: 'h1',
})`
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const OfflineMessage = styled(Typography).attrs({
  variant: 'body1',
})`
  font-size: 0.875rem;
`;

const OfflineErrorMessage = () => (
  <OfflineErrorMessageContainer>
    <InfoIcon />
    <OfflineTitle>You are currently offline</OfflineTitle>
    <OfflineMessage>
      You'll need an internet connection to request access to a new project. Come back when you're
      connected and try again.
    </OfflineMessage>
  </OfflineErrorMessageContainer>
);

export const ProjectAccessForm = ({
  project,
  onBack,
  countries,
  onSubmit,
  isSubmitting,
  isSuccess,
  backButtonText = 'Back to projects',
}: ProjectAccessFormProps) => {
  const formContext = useForm({
    mode: 'onChange',
  });
  const {
    formState: { isValid },
    register,
  } = formContext;

  const isOnline = window.navigator.onLine;

  if (!isOnline) {
    return (
      <>
        <OfflineErrorMessage />
        <StyledDialogActions>
          <FormButton variant="contained" onClick={onBack} color="primary">
            Back
          </FormButton>
        </StyledDialogActions>
      </>
    );
  }

  const projectCode = project?.code;
  const submitForm = (formData: any) => {
    onSubmit({
      ...formData,
      projectCode,
    });
  };

  if (isSubmitting) {
    return (
      <LoaderWrapper>
        <SpinningLoader />
      </LoaderWrapper>
    );
  }

  // the countries that are available to request
  const availableCountries = countries?.filter((c: Country) => !c.hasAccess && !c.hasPendingAccess);

  // show the no countries message if the country access list has loaded and there are no countries available
  const showNoCountriesMessage = !availableCountries?.length && !isSuccess;

  if (showNoCountriesMessage) {
    return (
      <>
        <Alert severity="info">
          There are no countries available to request access to for this project. This means you
          already have access to all countries in this project. If you need to change your
          permissions, please contact your system administrator.
        </Alert>
        <StyledDialogActions>
          <FormButton onClick={onBack} variant="text" color="default">
            Back
          </FormButton>
        </StyledDialogActions>
      </>
    );
  }

  // On success, show a success message to the user and direct them back to the projects list
  if (isSuccess)
    return (
      <>
        <RequestProjectAccessSuccessMessage projectName={project?.name} />
        <DialogActions>
          <FormButton onClick={onBack}>{backButtonText}</FormButton>
        </DialogActions>
      </>
    );

  const getTooltip = (country: Country) => {
    if (country.hasPendingAccess) {
      return 'Approval in progress';
    }
    if (country.hasAccess) {
      return 'You already have access to this country';
    }
    return undefined;
  };

  return (
    <Form onSubmit={submitForm as SubmitHandler<any>} formContext={formContext}>
      <FormControl>
        <FormGroup>
          {countries?.map(country => {
            const { id, name, hasPendingAccess, hasAccess } = country;
            const tooltip = getTooltip(country);
            return (
              <Checkbox
                id={id}
                inputRef={register({ validate: value => value.length > 0 })}
                disabled={hasPendingAccess || hasAccess}
                key={id}
                label={name}
                name="entityIds"
                value={id}
                tooltip={tooltip}
              />
            );
          })}
        </FormGroup>
      </FormControl>
      <FormInput Input={TextArea} name="message" />
      <StyledDialogActions>
        <FormButton variant="text" onClick={onBack} color="default">
          Back
        </FormButton>
        <FormButton
          type="submit"
          disabled={!isValid}
          tooltip={isValid ? undefined : 'Select one or more countries to proceed'}
        >
          Request access
        </FormButton>
      </StyledDialogActions>
    </Form>
  );
};
