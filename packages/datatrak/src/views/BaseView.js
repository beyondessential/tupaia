/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { FlexColumn } from '../components';

const Container = styled(FlexColumn)`
  padding-top: 3rem;
  min-height: 100vh;
  background: lightblue;
`;

const Title = styled(Typography)`
  font-style: normal;
  font-weight: 600;
  font-size: 2rem;
  line-height: 3rem;
  margin-bottom: 1.8rem;
  color: white;
`;

export const BaseView = ({ title }) => {
  return (
    <Container>
      <Title>{title}</Title>
    </Container>
  );
};

BaseView.propTypes = {
  title: PropTypes.string.isRequired,
};
