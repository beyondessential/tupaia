import React from 'react';
import { connect } from 'react-redux';
import MuiContainer from '@material-ui/core/Container';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { Dashboard, HomeButton, WarningCloud } from '@tupaia/ui-components';
import PropTypes from 'prop-types';
import { ProfileButton } from './ProfileButton';
import { checkIsMultiCountryUser, getCountryCodes, getHomeUrl } from '../store';
import { LightTab } from '../components';

const Wrapper = styled.nav`
  position: relative;
  z-index: 1;
  background-color: ${props => props.theme.palette.primary.main};
`;

const borderColor = 'rgba(255, 255, 255, 0.2)';

const Inner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${borderColor};
`;

const NavLinks = styled.div`
  display: flex;
  justify-content: flex-start;

  img {
    margin-right: 3rem;
  }
`;

const StyledTab = styled(LightTab)`
  border-bottom: 3px solid ${props => props.theme.palette.primary.main};
  transition: border-bottom-color 0.3s ease;

  &.Mui-selected {
    border-bottom-color: white;
  }
`;
const constructIsActive = tabDirectories => (_, location) =>
  tabDirectories.some(dir => location.pathname.split('/')[1] === dir);

const NavBarComponent = ({ links, homeUrl }) => (
  <Wrapper>
    <MuiContainer maxWidth="xl">
      <Inner>
        <NavLinks>
          <HomeButton homeUrl={homeUrl} source="/psss-logo-white.svg" />
          {links.map(({ label, to, isActive, icon, id }) => (
            <StyledTab
              isActive={isActive}
              activeClassName="Mui-selected"
              component={NavLink}
              key={to}
              to={to}
              value={to}
              id={id ?? null}
            >
              {icon}
              {label}
            </StyledTab>
          ))}
        </NavLinks>
        <ProfileButton />
      </Inner>
    </MuiContainer>
  </Wrapper>
);

NavBarComponent.propTypes = {
  homeUrl: PropTypes.string.isRequired,
  links: PropTypes.arrayOf(PropTypes.shape({})),
};

NavBarComponent.defaultProps = {
  links: [],
};

const makeLinks = state => {
  const countryCodes = getCountryCodes(state);
  const multiCountry = checkIsMultiCountryUser(state);
  return [
    {
      label: 'Weekly Reports',
      to: multiCountry ? '/' : `/weekly-reports/${countryCodes[0]}`,
      isActive: constructIsActive(['', 'weekly-reports']),
      icon: <Dashboard />,
    },
    {
      label: 'Alerts & Outbreaks',
      to: multiCountry ? '/alerts/active' : `/alerts/active/${countryCodes[0]}`,
      isActive: constructIsActive(['alerts']),
      icon: <WarningCloud />,
    },
  ];
};

const mapStateToProps = state => ({
  homeUrl: getHomeUrl(state),
  links: makeLinks(state),
});

export const NavBar = connect(mapStateToProps)(NavBarComponent);
