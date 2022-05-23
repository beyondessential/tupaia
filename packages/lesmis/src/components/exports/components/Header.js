import { Typography } from '@material-ui/core';
import { FlexColumn } from '@tupaia/ui-components';
import React from 'react';
import styled from 'styled-components';
import { I18n } from '../../../utils';

const Logo = styled.img`
  top: -10px;
  left: 0px;
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

const Header = () => {
  return (
    <div style={{ position: 'relative', padding: '50px' }}>
      <Logo alt="logo" src="/lesmis-logo-black.svg" />
      <FlexColumn>
        <Heading variant="h1">
          <I18n t="dashboards.districtProfile" />
        </Heading>
        <SubHeading variant="h2">2021</SubHeading>
      </FlexColumn>
    </div>
  );
};

export default Header;
