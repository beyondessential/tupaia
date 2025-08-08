import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { UserButton } from './UserButton';
import { HomeLink } from './HomeLink';
import { useUser } from '../../api/queries';
import { useLogout } from '../../api/mutations';
import { logout as logoutAction } from '../../authentication';

const Wrapper = styled.div`
  background-color: ${props => props.theme.palette.secondary.main};
  padding-block: 1rem;
  padding-inline: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1000;
  ${UserButton} {
    font-size: 0.875rem;
  }
  img {
    height: 2rem;
  }
`;

const TopNavbarComponent = ({ logo, homeLink, displayLogoutButton, disableHomeLink, onLogout }) => {
  const { isLoggedIn } = useUser();
  const { mutate: logout } = useLogout(onLogout);
  return (
    <Wrapper>
      <HomeLink logo={logo} homeLink={homeLink} disableHomeLink={disableHomeLink} />
      {isLoggedIn && displayLogoutButton && <UserButton onClick={logout}>Logout</UserButton>}
    </Wrapper>
  );
};

TopNavbarComponent.propTypes = {
  logo: PropTypes.shape({
    url: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
  }),
  homeLink: PropTypes.string,
  displayLogoutButton: PropTypes.bool,
  disableHomeLink: PropTypes.bool,
  onLogout: PropTypes.func.isRequired,
};

TopNavbarComponent.defaultProps = {
  logo: {
    url: '/admin-panel-logo-white.svg',
    alt: 'Tupaia Admin Panel Logo',
  },
  homeLink: '/',
  displayLogoutButton: true,
  disableHomeLink: false,
};

const mapDispatchToProps = dispatch => ({
  onLogout: () => dispatch(logoutAction()),
});

export const TopNavbar = connect(null, mapDispatchToProps)(TopNavbarComponent);
