/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { ScrollableBody } from '../layout';
import { useSurveyResponse } from '../api/queries';
import { SurveyReviewSection } from '../features/Survey/Components';
import { Button, SurveyTickIcon } from '../components';
import { shortDate } from '../utils';
import { useSurveyForm } from '../features';

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};

  .MuiSvgIcon-root {
    font-size: 2.5em;
    margin-right: 0.35em;
  }

  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding: 1rem 2rem;
  }
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding: 1.375rem 2rem;
  }
`;

const Heading = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.palette.text.primary};
  font-weight: 600;
  margin-bottom: 0.2rem;
  ${({ theme }) => theme.breakpoints.down('sm')} {
    font-size: 1rem;
  }
`;

const SubHeading = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-weight: 400;
  font-size: 1rem;
  ${({ theme }) => theme.breakpoints.down('sm')} {
    font-size: 0.875rem;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 1rem 0.5rem;
  border-top: 1px solid ${props => props.theme.palette.divider};
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding: 1rem;
  }
`;

const getSubHeadingText = surveyResponse => {
  if (!surveyResponse) {
    return null;
  }
  const date = shortDate(surveyResponse.dataTime);
  const country = surveyResponse?.countryName;
  const entity = surveyResponse?.entityName;
  const location = country === entity ? country : `${entity} | ${country}`;
  return `${location} ${date}`;
};

export const SurveyResponsePage = () => {
  const { surveyResponseId } = useParams();
  const { setFormData } = useSurveyForm();
  const formContext = useFormContext();
  const { data: surveyResponse } = useSurveyResponse(surveyResponseId);
  const answers = surveyResponse?.answers || {};
  const subHeading = getSubHeadingText(surveyResponse);

  useEffect(() => {
    if (answers) {
      formContext.reset(answers);
      setFormData(answers);
    }
  }, [JSON.stringify(answers)]);

  return (
    <>
      <Header>
        <SurveyTickIcon />
        <div>
          <Heading>{surveyResponse?.surveyName}</Heading>
          <SubHeading>{subHeading}</SubHeading>
        </div>
      </Header>
      <ScrollableBody>
        <SurveyReviewSection />
      </ScrollableBody>
      <FormActions>
        <Button to="/">Close</Button>
      </FormActions>
    </>
  );
};
