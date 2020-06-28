/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import React from 'react';
import { FlexSpaceBetween } from '../Layout';

const FooterContainer = styled.div`
  padding: 0 1.25rem;
`;

const FooterInner = styled(FlexSpaceBetween)`
  padding: 0.6rem 0 0.7rem;
  border-top: 1px solid ${props => props.theme.palette.grey['400']};
`;

const FooterText = styled(Typography)`
  font-size: 0.6875rem;
  line-height: 0.8rem;
  color: #888888;
  font-style: italic;
`;

const FooterUser = styled(FooterText)`
  margin-right: 0.5rem;
  color: ${props => props.theme.palette.text.primary};
  font-style: normal;
  font-weight: 500;
`;

const FooterAvatar = styled(Avatar)`
  width: 1.25rem;
  height: 1.25rem;
`;

export const UserMessageFooter = ({ dateTime, user }) => (
  <FooterContainer>
    <FooterInner>
      <FooterText>Last updated on: {format(dateTime, "dd/MM/yyyy - h:mmaaaaa'm'")}</FooterText>
      <FlexSpaceBetween>
        <FooterUser>{user.name}</FooterUser>
        <FooterAvatar src={user.avatar} />
      </FlexSpaceBetween>
    </FooterInner>
  </FooterContainer>
);

UserMessageFooter.propTypes = {
  user: PropTypes.object.isRequired,
  dateTime: PropTypes.instanceOf(Date).isRequired,
};
