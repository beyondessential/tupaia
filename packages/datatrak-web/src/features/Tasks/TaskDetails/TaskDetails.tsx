/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useParams } from 'react-router';
import styled from 'styled-components';
import { Paper } from '@material-ui/core';
import { useTask } from '../../../api';
import { TaskMetadata } from './TaskMetadata';

const Container = styled(Paper).attrs({
  variant: 'outlined',
})`
  padding: 2.5rem;
  display: flex;
  gap: 2.5rem;
`;

const MainColumn = styled.div`
  width: 50%;
`;

const SideColumn = styled.div`
  width: 25%;
`;

export const TaskDetails = () => {
  const { taskId } = useParams();
  const { data: task } = useTask(taskId);
  return (
    <Container>
      <SideColumn>
        <TaskMetadata task={task} />
      </SideColumn>
      <MainColumn />

      <SideColumn />
    </Container>
  );
};
