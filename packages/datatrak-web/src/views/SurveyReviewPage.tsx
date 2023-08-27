/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import { Button } from '@tupaia/ui-components';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../constants';

const Container = styled.div`
  margin-top: 3rem;
  margin-bottom: 3rem;
  padding: 3rem;
  background: white;
  max-width: 60rem;
  border-radius: 3px;
  border: 1px solid #dfdfdf;
`;
export const SurveyReviewPage = () => {
  const params = useParams();

  const navigate = useNavigate();

  const onSubmit = () => {
    const path = generatePath(ROUTES.SURVEY_SUCCESS, params);
    navigate(path);
  };
  return (
    <Container>
      <Typography variant="h4">Survey Review Screen</Typography>
      <Button onClick={onSubmit}>Submit</Button>
    </Container>
  );
};
