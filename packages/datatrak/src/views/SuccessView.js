/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { ButtonLink, FlexColumn } from '../components';

const Container = styled.div`
  padding: 1rem;
  text-align: center;
`;

const StyledImg = styled.img`
  height: 224px;
  width: auto;
  max-width: 100%;
  margin-bottom: 30px;
`;

const Title = styled(Typography)`
  font-weight: 600;
  font-size: 36px;
  line-height: 42px;
  color: #4e3838;
  margin-bottom: 60px;
`;

export const SuccessView = () => {
  const params = useParams();

  return (
    <Container>
      <StyledImg src="/success.svg" alt="success" />
      <Title>Survey submitted!</Title>
      <ButtonLink to="/">Close</ButtonLink>
    </Container>
  );
};
