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
  height: 500px;
  width: 800px;
  max-width: 100%;
  max-height: 100%;
  text-align: center;
  padding-top: 20%;
  padding-bottom: 30px;
`;

const Image = styled.img`
  width: 300px;
  max-width: 100%;
  margin-bottom: 30px;
`;

const Text = styled(Typography)`
  font-size: 18px;
  line-height: 21px;
  color: white;
  margin-bottom: 30px;
`;

const StyledButton = styled(PrimaryButton)`
  width: 300px;
`;

const NotFoundPageComponent = ({ goHome }) => {
  return (
    <Container>
      <Image src="/images/404.svg" />
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
