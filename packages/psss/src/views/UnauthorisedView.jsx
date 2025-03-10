import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { OutlinedButton } from '@tupaia/ui-components';
import Typography from '@material-ui/core/Typography';
import { Container, Header, HeaderTitle, Main } from '../components';
import { getHomeUrl } from '../store';

// Todo: Improve the layout of this view
// @see https://github.com/beyondessential/tupaia-backlog/issues/421
export const UnauthorisedViewComponent = ({ homeUrl }) => (
  <>
    <Header Title={<HeaderTitle title="Authorisation Required" />} />
    <Container maxWidth="xl">
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

UnauthorisedViewComponent.propTypes = {
  homeUrl: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  homeUrl: getHomeUrl(state),
});

export const UnauthorisedView = connect(mapStateToProps)(UnauthorisedViewComponent);
