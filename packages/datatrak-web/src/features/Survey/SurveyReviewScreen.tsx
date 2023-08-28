/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Button as MuiButton, Paper as MuiPaper } from '@material-ui/core';
import styled from 'styled-components';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { useSurveyForm } from './SurveyContext.tsx';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Button } from '@tupaia/ui-components';

const Container = styled.div`
  flex: 1;
  display: flex;
  padding-top: 2rem;
  padding-bottom: 2rem;
`;

const Paper = styled(MuiPaper).attrs({
  variant: 'outlined',
  elevation: 0,
})`
  flex: 1;
  overflow: auto;
  padding: 3rem;
  max-width: 70rem;
  margin: 0 auto;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3rem;
  border-top: 1px solid #dfdfdf;
`;

export const SurveyReviewScreen = () => {
  const params = useParams();
  const { formData, numberOfScreens } = useSurveyForm();

  const navigate = useNavigate();

  const onSubmit = () => {
    const path = generatePath(ROUTES.SURVEY_SUCCESS, params);
    navigate(path);
  };

  const onStepPrevious = () => {
    const path = generatePath(ROUTES.SURVEY_SCREEN, {
      ...params,
      screenNumber: String(numberOfScreens),
    });
    navigate(path);
  };

  return (
    <Container>
      <Paper>
        <h2>Review and submit</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias aperiam deleniti eaque
          esse, et harum iure nesciunt, nobis quo repudiandae, sequi tempore ullam voluptates! Ea
          eum expedita magnam quo recusandae.
        </p>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
        <FormActions>
          <MuiButton type="button" onClick={onStepPrevious} startIcon={<ArrowBackIosIcon />}>
            Back
          </MuiButton>
          <Button type="button" onClick={onSubmit}>
            Submit
          </Button>
        </FormActions>
      </Paper>
    </Container>
  );
};
