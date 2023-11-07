/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Paper } from '@material-ui/core';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const { from } = location.state as {
    from?: string;
  };

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
