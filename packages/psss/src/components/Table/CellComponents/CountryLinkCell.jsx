import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import MuiLink from '@material-ui/core/Link';
import Avatar from '@material-ui/core/Avatar';
import { Link as RouterLink } from 'react-router-dom';
import { getCountryName } from '../../../store';
import { countryFlagImage } from '../../../utils';
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

export const FakeCountryNameCell = ({ name, countryCode }) => (
  <CountryTitle component="button">
    <Avatar src={countryFlagImage(countryCode)} /> {name}
  </CountryTitle>
);

FakeCountryNameCell.propTypes = {
  name: PropTypes.string.isRequired,
  countryCode: PropTypes.string.isRequired,
};

export const CountryNameCell = ({ handleClick, organisationUnit }) => {
  const countryName = useSelector(state => getCountryName(state, organisationUnit));

  return (
    <CountryTitle onClick={handleClick} component="button">
      <Avatar src={countryFlagImage(organisationUnit)} /> {countryName}
    </CountryTitle>
  );
};

CountryNameCell.propTypes = {
  handleClick: PropTypes.func,
  organisationUnit: PropTypes.string,
};

CountryNameCell.defaultProps = {
  handleClick: () => {},
  organisationUnit: '',
};

export const CountryLinkCell = ({ target, organisationUnit }) => {
  const countryName = useSelector(state => getCountryName(state, organisationUnit));

  return (
    <CountryTitle to={target} component={RouterLink}>
      <Avatar src={countryFlagImage(organisationUnit)} /> {countryName}
    </CountryTitle>
  );
};

CountryLinkCell.propTypes = {
  target: PropTypes.string.isRequired,
  organisationUnit: PropTypes.string.isRequired,
};
