/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Link, useParams } from 'react-router-dom';
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

export const EntitiesView = () => {
  return (
    <Container>
      <Title>Entities View</Title>
      <Link to="/explore/utopia/covid-19/melbourne">Next</Link>
    </Container>
  );
};
