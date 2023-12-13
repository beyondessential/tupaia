/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { DialogActions } from '@material-ui/core';
import { Alert, Form as BaseForm, SpinningLoader } from '@tupaia/ui-components';
import { Button } from '../../components';
import { useExportSurveyResponses, ExportSurveyResponsesParams } from '../../api/mutations';
import { EntitySelectorInput, DateRangePicker, SurveysInput, EntityLevelInput } from './Inputs';

const Wrapper = styled.div`
  position: relative;
`;

const Form = styled(BaseForm)<{
  $isLoading: boolean;
}>`
  margin-top: 1.88rem;
  // if we display:none here, the fields remount after loading has finished, which means that if an error is hit the fields are reset
  visibility: ${({ $isLoading }) => ($isLoading ? 'hidden' : 'visible')};
  .MuiFormLabel-root,
  legend {
    color: inherit;
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }
`;

const ButtonGroup = styled(DialogActions)`
  padding: 0;
  ${({ theme }) => theme.breakpoints.down('xs')} {
    flex-direction: column;
    align-items: stretch;
    .MuiButtonBase-root {
      margin-left: 0;
      margin-bottom: 1rem;
    }
  }
`;

const SubmitButton = styled(Button)`
  padding: 0.5rem 3.44rem;
`;

const EmailDownloadAlert = styled(Alert).attrs({
  severity: 'info',
})`
  margin-bottom: 1rem;
  padding-left: 1.5rem;
`;

const LoadingContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.palette.background.paper};
  z-index: 2;
`;

const DEFAULT_FORM_VALUES = {
  entityLevel: 'country',
  startDate: null,
  endDate: null,
  surveys: [],
  country: null,
  entity: [],
};
export const Reports = () => {
  const {
    mutate: exportSurveyResponses,
    data: responseData,
    isLoading,
  } = useExportSurveyResponses();

  const formContext = useForm({
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const { reset, handleSubmit } = formContext;

  const onReset = () => {
    reset(DEFAULT_FORM_VALUES);
  };

  const onSubmit = (data: {
    surveys: { value: string }[];
    entityLevel: 'country' | 'entity';
    country: { code: string };
    entity: { value: string }[];
    startDate?: string;
    endDate?: string;
  }) => {
    const { surveys, entityLevel, country, entity, startDate, endDate } = data;

    const surveyCodes = surveys.map(({ value }: { value: string }) => value).join(',');

    const params = {
      surveyCodes,
      startDate,
      endDate,
    } as ExportSurveyResponsesParams;
    if (entityLevel === 'country') {
      params.countryCode = country.code;
    } else {
      params.entityIds = entity.map(({ value }: { value: string }) => value).join(',');
    }
    exportSurveyResponses(params);
  };

  return (
    <Wrapper>
      {isLoading && (
        <LoadingContainer>
          <SpinningLoader />
        </LoadingContainer>
      )}
      <Form onSubmit={handleSubmit(onSubmit)} formContext={formContext} $isLoading={isLoading}>
        {responseData?.emailTimeoutHit && (
          <EmailDownloadAlert>
            This export is taking a while, and will continue in the background. You will be emailed
            when the export process completes.
          </EmailDownloadAlert>
        )}
        <SurveysInput />
        <EntityLevelInput />
        {/** Render both of these, and then handle hiding with isActive prop. This means that when we change entityLevel we don't get weird rendering of selected values from the wrong entity type */}
        <EntitySelectorInput entityLevel="country" />
        <EntitySelectorInput entityLevel="entity" />
        <DateRangePicker />
        <ButtonGroup>
          <Button variant="text" color="primary" onClick={onReset}>
            Clear fields
          </Button>
          <SubmitButton type="submit">Export</SubmitButton>
        </ButtonGroup>
      </Form>
    </Wrapper>
  );
};
