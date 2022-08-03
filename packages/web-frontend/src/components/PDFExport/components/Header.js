import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { FlexCenter as BaseFlexCenter, FlexColumn as BaseFlexColumn } from '@tupaia/ui-components';
import { TUPAIA_BLACK_LOGO_SRC } from '../../../constants';

const FlexCenter = styled(BaseFlexCenter)`
  position: relative;
  padding: 50px;
`;

const FlexColumn = styled(BaseFlexColumn)`
  text-align: center;
`;

const Heading = styled(Typography)`
  font-weight: 600;
  line-height: 140%;
  text-transform: capitalize;
  color: ${props => props.theme.palette.primary.main};
`;

const Header = ({ dashboardLabel }) => {
  return (
    <FlexCenter>
      <img src={TUPAIA_BLACK_LOGO_SRC} alt="Tupaia logo" />
      <FlexColumn>
        <Heading variant="h1">{dashboardLabel}</Heading>
      </FlexColumn>
    </FlexCenter>
  );
};

Header.propTypes = {
  dashboardLabel: PropTypes.string.isRequired,
};

Header.defaultProps = {};

export default Header;
