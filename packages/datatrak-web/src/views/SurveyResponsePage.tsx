/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Paper as MuiPaper } from '@material-ui/core';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ScrollableBody } from '../layout';
import { useSurveyResponse } from '../api/queries';
import { HEADER_HEIGHT } from '../constants';
import { SurveyReviewSection, SurveyScreenHeader } from '../features/Survey/Components';
import { Button } from '../components';

const LayoutContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  height: calc(100vh - ${HEADER_HEIGHT});
  padding: 3.5rem 0 2rem;
`;

const Paper = styled(MuiPaper).attrs({
  variant: 'outlined',
  elevation: 0,
})`
  flex: 1;
  max-width: 63rem;
  padding: 0;
  overflow: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 0;
  ${({ theme }) => theme.breakpoints.up('md')} {
    margin-left: 1rem;
    border-radius: 4px;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0.5rem;
  border-top: 1px solid ${props => props.theme.palette.divider};
  button:last-child {
    margin-left: auto;
  }
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding: 1rem;
  }
`;

export const SurveyResponsePage = () => {
  const { surveyResponseId } = useParams();
  const formContext = useFormContext();
  const { data: surveyResponse } = useSurveyResponse(surveyResponseId);
  const answers = surveyResponse?.answers || {};

  useEffect(() => {
    if (answers) {
      formContext.reset(answers);
    }
  }, [JSON.stringify(answers)]);

  const description = `${surveyResponse?.entityName} | ${surveyResponse?.countryName} ${surveyResponse?.dataTime}`;

  return (
    <LayoutContainer>
      <Paper>
        <SurveyScreenHeader heading={surveyResponse?.surveyName} description={description} />
        <ScrollableBody>
          <SurveyReviewSection />
        </ScrollableBody>
        <FormActions>
          <Button>Close</Button>
        </FormActions>
      </Paper>
    </LayoutContainer>
  );
};
