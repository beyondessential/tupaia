/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { OutlinedButton } from '@tupaia/ui-components';
import Typography from '@material-ui/core/Typography';
import { Container, Header, HeaderTitle, Main } from '../components';
import { getHomeUrl } from '../store';

export const UnAuthorisedViewComponent = ({ homeUrl }) => (
  <>
    <Header Title={<HeaderTitle title="401 UnAuthorised" />} />
    <Container>
      <Main>
        <br />
        <br />
        <Typography variant="h2" gutterBottom>
          You are not authorised to view this page
        </Typography>
        <Typography gutterBottom>
          If you would like to request access please contact a Tupaia administrator at{' '}
          <a href="https://info.tupaia.org/contact">https://info.tupaia.org/contact</a>
        </Typography>
        <br />
        <OutlinedButton component="a" href={homeUrl}>
          Go back to home page
        </OutlinedButton>
      </Main>
    </Container>
  </>
);

UnAuthorisedViewComponent.propTypes = {
  homeUrl: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  homeUrl: getHomeUrl(state),
});

export const UnAuthorisedView = connect(mapStateToProps)(UnAuthorisedViewComponent);
