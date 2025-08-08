import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { Avatar } from '../Avatar';
import { FlexSpaceBetween } from '../Layout';
import { AM_PM_DATE_FORMAT, DAY_MONTH_YEAR_DATE_FORMAT } from '../../constants';

const Header = styled(FlexSpaceBetween)`
  padding: 0.3rem 0 0.3rem 1rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const StyledAvatar = styled(Avatar)`
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

export const UserMessageHeader = ({ user, dateTime, ActionsMenu }) => {
  const userInitial = user.name.substring(0, 1);
  return (
    <Header>
      <FlexSpaceBetween>
        <StyledAvatar initial={userInitial} src={user.profileImage}>
          {userInitial}
        </StyledAvatar>
        <Title>{user.name}</Title>
      </FlexSpaceBetween>
      <FlexSpaceBetween>
        <Date>{format(dateTime, DAY_MONTH_YEAR_DATE_FORMAT)}</Date>
        <Time>{format(dateTime, AM_PM_DATE_FORMAT)}</Time>
        {ActionsMenu}
      </FlexSpaceBetween>
    </Header>
  );
};

UserMessageHeader.propTypes = {
  user: PropTypes.PropTypes.shape({
    name: PropTypes.string,
    profileImage: PropTypes.string,
  }).isRequired,
  dateTime: PropTypes.object.isRequired,
  ActionsMenu: PropTypes.any,
};

UserMessageHeader.defaultProps = {
  ActionsMenu: null,
};
