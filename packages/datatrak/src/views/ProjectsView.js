/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { FlexColumn } from '../components';

const Container = styled(FlexColumn)`
  padding: 1rem;
  background: white;
`;

const Title = styled(Typography)`
  font-style: normal;
  font-weight: 600;
  font-size: 2rem;
  line-height: 3rem;
  margin-bottom: 1.8rem;
`;

export const ProjectsView = () => {
  return (
    <Container>
      <Title>Projects View</Title>
      <Link to="/explore/countries">Next</Link>
    </Container>
  );
};
