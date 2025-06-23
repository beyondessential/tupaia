import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import MuiAvatar from '@material-ui/core/Avatar';
import * as COLORS from '../../constants';

const Header = styled.div`
  display: flex;
  flex-direction: column;
  color: ${COLORS.WHITE};
  background: ${COLORS.BLUE};
  height: 12.5rem;
  padding: 0 1.25rem 0.5rem;
`;

const HeaderContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const HeaderInner = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  margin-left: 1rem;
`;

const HeaderHeading = styled(Typography)`
  font-weight: 500;
  font-size: 2rem;
  line-height: 2.3rem;
  margin-bottom: 0.3rem;
`;

const HeaderSubHeading = styled(Typography)`
  font-weight: 500;
  font-size: 1.125rem;
  line-height: 1.3rem;
`;

const Avatar = styled(MuiAvatar)`
  height: 5rem;
  width: 5rem;
  margin-right: 0.9rem;
  color: white;
`;

export const DrawerHeader = ({ heading, date, avatarUrl }) => (
  <Header>
    <HeaderContent>
      <HeaderInner>
        <Avatar src={avatarUrl} />
        <div>
          <HeaderHeading>{heading}</HeaderHeading>
          <HeaderSubHeading>{date}</HeaderSubHeading>
        </div>
      </HeaderInner>
    </HeaderContent>
  </Header>
);

DrawerHeader.propTypes = {
  heading: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  date: PropTypes.string.isRequired,
};

DrawerHeader.defaultProps = {
  avatarUrl: null,
};
