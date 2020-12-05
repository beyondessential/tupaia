/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import MuiLink from '@material-ui/core/Link';
import Avatar from '@material-ui/core/Avatar';
import { Link as RouterLink } from 'react-router-dom';
import { countryFlagImage, getCountryName } from '../../../utils';
import * as COLORS from '../../../constants/colors';

const CountryTitle = styled(MuiLink)`
  display: flex;
  align-items: center;
  font-weight: 400;
  font-size: 1.125rem;
  color: ${COLORS.BLUE};
  line-height: 1.2;

  .MuiAvatar-root {
    margin-right: 0.6rem;
    color: ${COLORS.GREY_DE};
    background-color: ${COLORS.GREY_DE};
  }

  &.MuiLink-button {
    text-align: left;
  }
`;

export const CountryNameCell = ({ handleClick, name, countryCode }) => (
  <CountryTitle onClick={handleClick} component="button">
    <Avatar src={countryFlagImage(countryCode)} /> {name}
  </CountryTitle>
);

CountryNameCell.propTypes = {
  handleClick: PropTypes.func,
  name: PropTypes.string.isRequired,
  countryCode: PropTypes.string,
};

CountryNameCell.defaultProps = {
  handleClick: null,
  countryCode: null,
};

export const CountryNameLinkCell = ({ organisationUnit }) => {
  const countryCode = organisationUnit;
  return (
    <CountryTitle to={`weekly-reports/${countryCode}`} component={RouterLink}>
      <Avatar src={countryFlagImage(countryCode)} /> {getCountryName(countryCode)}
    </CountryTitle>
  );
};

CountryNameLinkCell.propTypes = {
  organisationUnit: PropTypes.string.isRequired,
};
