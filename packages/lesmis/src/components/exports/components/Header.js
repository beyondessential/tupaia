import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { FlexColumn } from '@tupaia/ui-components';

const Logo = styled.img`
  top: 30px;
  left: 50px;
  position: absolute;
`;

const Heading = styled(Typography)`
  font-weight: 600;
  line-height: 140%;
  text-transform: capitalize;
  color: ${props => props.theme.palette.primary.main};
`;

const SubHeading = styled(Typography)`
  font-weight: 600;
  line-height: 140%;
  text-transform: capitalize;
`;

const Header = ({ dashboardLabel }) => {
  return (
    <div style={{ position: 'relative', padding: '50px' }}>
      <Logo alt="logo" src="/lesmis-logo-black.svg" />
      <FlexColumn>
        <Heading variant="h1">{dashboardLabel}</Heading>
        <SubHeading variant="h2">2021</SubHeading>
      </FlexColumn>
    </div>
  );
};

Header.propTypes = {
  dashboardLabel: PropTypes.string.isRequired,
};

export default Header;
