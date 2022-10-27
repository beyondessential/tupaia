/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Button } from '@tupaia/ui-components';
import { generatePath, useHistory, useParams } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { useSurveyForm } from '../SurveyFormContext';
import { useSubmitSurvey } from '../api/mutations';

const Container = styled.div`
  padding: 1rem;
  text-align: center;
`;

const StyledImg = styled.img`
  height: 100px;
  width: auto;
  margin-top: 10px;
  margin-bottom: 60px;
`;

const Title = styled(Typography)`
  font-weight: 600;
  font-size: 24px;
  line-height: 28px;
  margin-bottom: 15px;
`;

const Text = styled(Typography)`
  font-weight: 400;
  font-size: 16px;
  line-height: 19px;
  margin-bottom: 70px;
  color: #4e3838;
`;

export const SubmitView = () => {
  const { mutate: submitSurvey, isError, isLoading, isSuccess, error } = useSubmitSurvey();
  const { push } = useHistory();
  const { formData } = useSurveyForm();

  const onSubmitForm = async () => {
    // Todo: Get the entity id from the survey

    await submitSurvey(formData);
    // alert(JSON.stringify(formData));
    // const path = generatePath('/:projectId/:countryId/:surveyId/success', params);
    // push(path);
  };

  return (
    <Container>
      <StyledImg src="/tupaia-pin.svg" alt="success" />
      <Title>Submit your survey</Title>
      <Text>
        You are now ready to submit your answers to Tupaia. Once submitted, your survey answers will
        be uploaded.
      </Text>
      <Button onClick={onSubmitForm}>Submit</Button>
    </Container>
  );
};
