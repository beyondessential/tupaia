import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@material-ui/core';

const requestAnAccountUrl = 'https://info.tupaia.org/contact';

export const RegisterLink = ({ text }) => {
  return (
    <Link href={requestAnAccountUrl} target="_blank">
      {text}
    </Link>
  );
};

RegisterLink.propTypes = {
  text: PropTypes.string,
};

RegisterLink.defaultProps = {
  text: 'Request an account',
};
