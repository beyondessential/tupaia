import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { OutlinedButton } from '@tupaia/ui-components';
import Typography from '@material-ui/core/Typography';
import { Container, Header, HeaderTitle, Main } from '../components';
import { getHomeUrl } from '../store';

// Todo: Improve the layout of this view
// @see https://github.com/beyondessential/tupaia-backlog/issues/421
export const NotFoundViewComponent = ({ homeUrl }) => (
  <>
    <Header Title={<HeaderTitle title="404 Page Not Found" />} />
    <Container maxWidth="xl">
      <Main>
        <br />
        <br />
        <Typography variant="h2" gutterBottom>
          The page you are looking for does not exist.
        </Typography>
        <br />
        <OutlinedButton component="a" href={homeUrl}>
          Go back to home page
        </OutlinedButton>
      </Main>
    </Container>
  </>
);

NotFoundViewComponent.propTypes = {
  homeUrl: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  homeUrl: getHomeUrl(state),
});

export const NotFoundView = connect(mapStateToProps)(NotFoundViewComponent);
