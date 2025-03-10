import React from 'react';
import styled from 'styled-components';
import { Paper, Typography } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import { ProjectSelectForm } from '@tupaia/ui-components';
import { useFromLocation } from '../utils';
import { ROUTES } from '../constants';
import { useEditUser, useProjects } from '../api';

const Container = styled(Paper).attrs({
  variant: 'outlined',
})`
  width: 48rem;
  display: flex;
  flex-direction: column;
`;

const Title = styled(Typography).attrs({
  variant: 'h1',
})`
  font-size: 1.125rem;
`;

export const ProjectSelectPage = () => {
  const { data: projects, isLoading } = useProjects();
  const { mutate: onConfirm, isLoading: isConfirming } = useEditUser();

  const navigate = useNavigate();
  const from = useFromLocation();

  const onRequestAccess = (projectCode: string) => {
    navigate({
      pathname: ROUTES.REQUEST_ACCESS,
      search: `?project=${projectCode}`,
    });
  };

  const onSuccess = () => {
    navigate(from || ROUTES.HOME, {
      state: null,
    });
  };

  return (
    <Container>
      <Title>Select project</Title>
      <ProjectSelectForm
        onRequestAccess={onRequestAccess}
        onClose={onSuccess}
        projects={projects}
        isLoading={isLoading}
        onConfirm={onConfirm}
        isConfirming={isConfirming}
      />
    </Container>
  );
};
