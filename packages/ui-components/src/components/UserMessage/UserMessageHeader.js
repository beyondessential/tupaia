/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import MuiAvatar from '@material-ui/core/Avatar';
import { FlexSpaceBetween } from '../Layout';

const Header = styled(FlexSpaceBetween)`
  padding: 0.3rem 0 0.3rem 1rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const Avatar = styled(MuiAvatar)`
  width: 35px;
  height: 35px;
`;

const Title = styled(Typography)`
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1rem;
  margin-left: 0.5rem;
  color: ${props => props.theme.palette.text.primary};
`;

const Date = styled(Title)`
  font-weight: 400;
`;

const Time = styled(Date)`
  color: ${props => props.theme.palette.text.secondary};
  margin-left: 0.6rem;
`;

export const UserMessageHeader = ({ user, dateTime, ActionsMenu }) => (
  <Header>
    <FlexSpaceBetween>
      <Avatar src={user.avatar} />
      <Title>{user.name}</Title>
    </FlexSpaceBetween>
    <FlexSpaceBetween>
      <Date>{format(dateTime, 'dd/MM/yyyy')}</Date>
      <Time>{format(dateTime, "h:mmaaaaa'm'")}</Time>
      {ActionsMenu}
    </FlexSpaceBetween>
  </Header>
);

UserMessageHeader.propTypes = {
  user: PropTypes.object.isRequired,
  dateTime: PropTypes.object.isRequired,
  ActionsMenu: PropTypes.any,
};

UserMessageHeader.defaultProps = {
  ActionsMenu: null,
};
