import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { FlexCenter as BaseFlexCenter, FlexColumn as BaseFlexColumn } from '@tupaia/ui-components';
import { Logo } from './Logo';

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

const SubHeading = styled(Typography)`
  font-weight: 600;
  line-height: 140%;
  text-transform: capitalize;
`;

const Header = ({ dashboardLabel, useYearSelector, selectedYear }) => {
  return (
    <FlexCenter>
      <Logo />
      <FlexColumn>
        <Heading variant="h1">{dashboardLabel}</Heading>
        {useYearSelector && <SubHeading variant="h2">{selectedYear}</SubHeading>}
      </FlexColumn>
    </FlexCenter>
  );
};

Header.propTypes = {
  dashboardLabel: PropTypes.string.isRequired,
  useYearSelector: PropTypes.bool,
  selectedYear: PropTypes.string,
};

Header.defaultProps = {
  useYearSelector: false,
  selectedYear: null,
};

export default Header;
