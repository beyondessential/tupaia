import React from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { DialogActions } from '@material-ui/core';
import { Alert, Form as BaseForm, SpinningLoader } from '@tupaia/ui-components';
import { stripTimezoneFromDate } from '@tupaia/utils';
import { Button } from '../../components';
import { useExportSurveyResponses, ExportSurveyResponsesParams } from '../../api/mutations';
import { EntitySelectorInput, DateRangePicker, SurveysInput, EntityLevelInput } from './Inputs';
import { COUNTRY_LEVEL_ENTITY, ENTITY_LEVEL_ENTITY } from './constants';

const Wrapper = styled.div`
  position: relative;
  .MuiInputLabel-outlined {
    z-index: 0;
  }
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
  entityLevel: COUNTRY_LEVEL_ENTITY,
  startDate: null,
  endDate: null,
  surveys: [],
  country: null,
  entity: [],
};

type DataType = {
  surveys: { value: string }[];
  entityLevel: typeof COUNTRY_LEVEL_ENTITY | typeof ENTITY_LEVEL_ENTITY;
  country: { code: string };
  entity: { value: string }[];
  startDate?: string;
  endDate?: string;
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

  const { reset, handleSubmit, watch } = formContext;

  const onReset = () => {
    reset(DEFAULT_FORM_VALUES);
  };

  const getSubmitFormParams = (data: DataType) => {
    const params = {
      surveyCodes: data.surveys.map(({ value }: { value: string }) => value).join(','),
      startDate: data.startDate ? stripTimezoneFromDate(data.startDate) : undefined,
      endDate: data.endDate ? stripTimezoneFromDate(data.endDate) : undefined,
    } as ExportSurveyResponsesParams;
    if (data.entityLevel === COUNTRY_LEVEL_ENTITY) {
      return {
        ...params,
        countryCode: data.country.code,
      };
    } else {
      return {
        ...params,
        entityIds: data.entity.map(({ value }: { value: string }) => value).join(','),
      };
    }
  };

  const onSubmit = (data: DataType) => {
    const params = getSubmitFormParams(data);

    exportSurveyResponses(params);
  };

  const selectedEntityLevel = watch('entityLevel');
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

        <EntitySelectorInput key={selectedEntityLevel} selectedEntityLevel={selectedEntityLevel} />
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
