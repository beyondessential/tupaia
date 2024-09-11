/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { List, Typography } from '@material-ui/core';
import { Button, SpinningLoader } from '@tupaia/ui-components';
import { CheckboxList, Form as BaseForm } from '../../../../components';
import { URL_SEARCH_PARAMS } from '../../../../constants';

const ListItem = styled.li`
  text-align: center;
  font-size: 1.25rem;
  &:not(:last-child) {
    margin-bottom: 0.625rem;
  }
`;

const Form = styled(BaseForm)`
  flex-grow: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  align-items: center;
  > fieldset {
    flex-grow: 1;
  }
  .MuiBox-root {
    flex: 1;
  }
  legend {
    margin-bottom: 1.5rem;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 1.5rem;
  width: 100%;
`;

const FormButton = styled(Button)`
  text-transform: none;
`;

const CheckboxListWrapper = styled.div`
  width: 30rem;
  max-width: 100%;
  flex-grow: 1;
`;

const ErrorMessage = styled(Typography).attrs({
  variant: 'body1',
  color: 'error',
})`
  margin-bottom: 1rem;
`;

interface DownloadVisualProps {
  options: { label?: string; value: any }[];
  isLoading: boolean;
  onDownload: (selectedValues: string[]) => void;
  isEnlarged?: boolean;
  children?: React.ReactNode;
  error?: Error;
  onClose?: () => void;
}

/**
 * @description Component for downloading data from a visual. This component is used in the DataDownload and DownloadFiles visuals.
 */
export const DownloadVisual = ({
  options,
  isLoading,
  onDownload,
  isEnlarged,
  children,
  error,
  onClose,
}: DownloadVisualProps) => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const reportCode = urlSearchParams.get(URL_SEARCH_PARAMS.REPORT);
  const formContext = useForm({
    mode: 'onChange',
  });
  const selectedValues = formContext.watch(reportCode!);

  if (!isEnlarged)
    return <List>{options?.map(({ label }) => <ListItem key={label}>{label}</ListItem>)}</List>;

  const closeModal = () => {
    urlSearchParams.delete(URL_SEARCH_PARAMS.REPORT);
    urlSearchParams.delete(URL_SEARCH_PARAMS.REPORT_PERIOD);
    setUrlSearchParams(urlSearchParams);
    if (onClose) onClose();
  };
  return isLoading ? (
    <SpinningLoader />
  ) : (
    <Form formContext={formContext}>
      {children}
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
      <CheckboxListWrapper>
        <CheckboxList
          options={options}
          name={reportCode!}
          legend="Select the data you wish to download"
          required
        />
      </CheckboxListWrapper>

      <ButtonWrapper>
        <FormButton variant="outlined" color="default" onClick={closeModal}>
          Cancel
        </FormButton>
        <FormButton
          disabled={!selectedValues || selectedValues.length === 0 || isLoading}
          onClick={() => onDownload(selectedValues)}
        >
          Download
        </FormButton>
      </ButtonWrapper>
    </Form>
  );
};
