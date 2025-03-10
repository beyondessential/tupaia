import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import MuiButton from '@material-ui/core/Button';

import { useUrlParams, I18n } from '../utils';

const TextButton = styled(MuiButton)`
  margin-right: 10px;
  color: white;

  &.round {
    color: ${props => props.theme.palette.primary.main};
    border-color: ${props => props.theme.palette.primary.main};
    padding: 0.3rem 1rem;
    border-radius: 2.5rem;
  }
`;

export const SignUpLink = ({ isRound }) => {
  const location = useLocation();
  const { locale } = useUrlParams();

  return (
    <TextButton
      variant={isRound && 'outlined'}
      component={RouterLink}
      to={`/${locale}/register`}
      state={{ referer: location.pathname }}
      className={isRound && 'round'}
    >
      <I18n t="home.signUp" />
    </TextButton>
  );
};

SignUpLink.propTypes = {
  isRound: PropTypes.bool,
};

SignUpLink.defaultProps = {
  isRound: false,
};
