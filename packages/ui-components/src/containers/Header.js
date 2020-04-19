/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import Container from '@material-ui/core/Container';
import { SystemUpdateAlt } from '@material-ui/icons';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import { LightOutlinedButton } from '../components/Button';
import { LightProfileButton } from '../components/ProfileButton';
import { NavBar } from '../components/NavBar';
import { LightBreadcrumbs } from '../components/Breadcrumbs';
import { HomeButton } from '../components/HomeButton';
import { Dashboard, WarningCloud } from '../components/Icons';
import * as COLORS from '../theme/colors';

export default {
  title: 'Header',
};

const links = [
  {
    label: 'Weekly Reports',
    to: '/',
    icon: <Dashboard />,
  },
  {
    label: 'Alerts & Outbreaks',
    to: '/alerts',
    icon: <WarningCloud />,
  },
];

const Profile = () => <LightProfileButton startIcon={<Avatar>T</Avatar>}>Tom</LightProfileButton>;

const HeaderMain = styled.header`
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
`;

const HeaderInner = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 0 38px;
`;

export const Header = ({ Toolbar, children, ...props }) => (
  <div {...props}>
    <NavBar HomeButton={HomeButton} links={links} Profile={Profile} />
    <HeaderMain>
      <Container maxWidth="lg">
        <HeaderInner>
          <div>
            <LightBreadcrumbs />
            <Typography variant="h1" component="h1">
              American Samoa
            </Typography>
          </div>
          <LightOutlinedButton endIcon={<SystemUpdateAlt />}>Export Data</LightOutlinedButton>
        </HeaderInner>
      </Container>
    </HeaderMain>
    {Toolbar}
  </div>
);

Header.propTypes = {
  Toolbar: PropTypes.node,
  children: PropTypes.array,
};

Header.defaultProps = {
  Toolbar: null,
  children: null,
};
