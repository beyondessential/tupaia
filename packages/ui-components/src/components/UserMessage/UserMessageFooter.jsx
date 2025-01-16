import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { FlexSpaceBetween } from '../Layout';
import { Avatar } from '../Avatar';
import { AM_PM_DATE_FORMAT, DAY_MONTH_YEAR_DATE_FORMAT } from '../../constants';

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

export const UserMessageFooter = ({ dateTime, user }) => {
  const userInitial = user.name.substring(0, 1);
  return (
    <FooterContainer>
      <FooterInner>
        <FooterText>
          Last updated on:{' '}
          {format(dateTime, `${DAY_MONTH_YEAR_DATE_FORMAT} - ${AM_PM_DATE_FORMAT}`)}
        </FooterText>
        <FlexSpaceBetween>
          <FooterUser>{user.name}</FooterUser>
          <FooterAvatar initial={userInitial} src={user.profileImage}>
            {userInitial}
          </FooterAvatar>
        </FlexSpaceBetween>
      </FooterInner>
    </FooterContainer>
  );
};

UserMessageFooter.propTypes = {
  user: PropTypes.PropTypes.shape({
    name: PropTypes.string,
    profileImage: PropTypes.string,
  }).isRequired,
  dateTime: PropTypes.instanceOf(Date).isRequired,
};
