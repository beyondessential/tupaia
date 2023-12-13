/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Paper } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import { useFromLocation } from '../utils';
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
  const from = useFromLocation();

  const onSuccess = () => {
    navigate(from || ROUTES.HOME, {
      state: null,
    });
  };

  return (
    <Container>
      <ProjectSelectForm onClose={onSuccess} />
    </Container>
  );
};
