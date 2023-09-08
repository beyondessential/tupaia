/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Paper } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import { ProjectSelectForm } from '../features';
import { ROUTES } from '../constants';

const Container = styled(Paper).attrs({
  variant: 'outlined',
})`
  width: 48rem;
  display: flex;
  flex-direction: column;
`;
export const ProjectSelectPage = () => {
  const navigate = useNavigate();

  const onSuccess = () => {
    navigate(ROUTES.HOME);
  };

  return (
    <Container>
      <ProjectSelectForm onSuccess={onSuccess} />
    </Container>
  );
};
