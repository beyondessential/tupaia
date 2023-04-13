/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { PrimaryButton } from '../../../components/Buttons';
import { goHome } from '../../../actions';
import { connect } from 'react-redux';

const Container = styled.div`
  height: 32rem;
  width: 50rem;
  max-width: 100%;
  max-height: 100%;
  text-align: center;
  padding-top: 20%;
  padding-bottom: 1.875rem;
`;

const Image = styled.img`
  width: 18.75rem;
  max-width: 100%;
  margin-bottom: 1.875rem;
`;

const Text = styled(Typography)`
  font-size: 1.125rem;
  line-height: 1.2;
  color: ${props => props.theme.palette.common.white};
  margin-bottom: 1.875rem;
`;

const StyledButton = styled(PrimaryButton)`
  width: 18.75rem;
`;

const NotFoundPageComponent = ({ goHome }) => {
  return (
    <Container>
      <Image src="/images/404.svg" alt="page not found" />
      <Text>The page you are looking for does not exist</Text>
      <StyledButton variant="contained" color="primary" onClick={goHome}>
        Back to home page
      </StyledButton>
    </Container>
  );
};

const mapDispatchToProps = dispatch => ({
  goHome: () => {
    dispatch(goHome());
  },
});

export const NotFoundPage = connect(null, mapDispatchToProps)(NotFoundPageComponent);
