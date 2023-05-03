import React from 'react';
import PropTypes from 'prop-types';

export function SingleProjectLandingPage({ isUserLoggedIn, project }) {
  return <div>SingleProjectLandingPage</div>;
}

SingleProjectLandingPage.propTypes = {
  isUserLoggedIn: PropTypes.bool.isRequired,
  project: PropTypes.object.isRequired,
};
