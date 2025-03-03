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
  height: 15rem;
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
  font-size: 1.3rem;
  line-height: 1.5rem;
`;

const Text = styled(Typography)`
  font-weight: 500;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const Date = styled(Typography)`
  font-size: 0.875rem;
  font-weight: 400;
`;

const Avatar = styled(MuiAvatar)`
  height: 3rem;
  width: 3rem;
  margin-right: 0.8rem;
`;

const Heading = styled(Typography)`
  margin-top: 0.7rem;
  font-weight: 500;
  font-size: 2rem;
  line-height: 2.3rem;
`;

export const AlertsDrawerHeader = React.memo(
  ({ heading, subheading, dateText, date, color, avatarUrl, DropdownMenu }) => (
    <Header color={color}>
      <SpaceBetween>
        <div>
          <Text>{dateText}</Text>
          <Date>{date}</Date>
        </div>
        {DropdownMenu}
      </SpaceBetween>
      <div>
        <Row>
          <Avatar src={avatarUrl} />
          <Subheading>{subheading}</Subheading>
        </Row>
        <Heading>{heading}</Heading>
      </div>
    </Header>
  ),
);

AlertsDrawerHeader.propTypes = {
  DropdownMenu: PropTypes.node,
  heading: PropTypes.string.isRequired,
  subheading: PropTypes.string.isRequired,
  dateText: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  color: PropTypes.string,
};

AlertsDrawerHeader.defaultProps = {
  DropdownMenu: null,
  avatarUrl: null,
  color: COLORS.BLUE,
};
