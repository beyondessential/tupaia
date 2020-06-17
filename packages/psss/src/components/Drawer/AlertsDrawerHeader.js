/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import MuiAvatar from '@material-ui/core/Avatar';
import PropTypes from 'prop-types';
import * as COLORS from '../../constants';

const Header = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: ${props => props.color};
  color: ${COLORS.WHITE};
  height: 250px;
  padding: 1rem 1.25rem 2rem;
`;

const SpaceBetween = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Row = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const Subheading = styled(Typography)`
  font-weight: 400;
  font-size: 21px;
  line-height: 25px;
`;

const Text = styled(Typography)`
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 0.5rem;
`;

const Date = styled(Typography)`
  font-weight: 400;
  font-size: 14px;
`;

const Avatar = styled(MuiAvatar)`
  height: 3rem;
  width: 3rem;
  margin-right: 0.9rem;
`;

const Heading = styled(Typography)`
  margin-top: 0.8rem;
  font-weight: 500;
  font-size: 2rem;
  line-height: 2.3rem;
`;

export const AlertsDrawerHeader = ({ heading, subheading, date, color, avatarUrl }) => (
  <Header color={color}>
    <SpaceBetween>
      <div>
        <Text>Triggered on:</Text>
        <Date>{date}</Date>
      </div>
      <div>State: Alert</div>
    </SpaceBetween>
    <div>
      <Row>
        <Avatar src={avatarUrl} />
        <Subheading>{subheading}</Subheading>
      </Row>
      <Heading>{heading}</Heading>
    </div>
  </Header>
);

AlertsDrawerHeader.propTypes = {
  heading: PropTypes.string.isRequired,
  subheading: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  color: PropTypes.string,
};

AlertsDrawerHeader.defaultProps = {
  avatarUrl: null,
  color: COLORS.BLUE,
};
