/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { ElementType, FC, ReactElement, ReactNode } from 'react';
import MuiContainer from '@material-ui/core/Container';
import styled from 'styled-components';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import { LightTab } from './Tabs';

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

interface LinkProps {
  label: ReactNode;
  to: string;
  isActive?: (
    match: RouteComponentProps['match'],
    location: RouteComponentProps['location'],
  ) => boolean;
  icon?: ReactNode;
  id?: string;
}

export const NavBar: FC<{
  HomeButton: ReactNode;
  Profile: ElementType;
  links: LinkProps[];
  isTabActive?: (
    match: RouteComponentProps['match'],
    location: RouteComponentProps['location'],
  ) => boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  className?: string;
}> = ({
  HomeButton,
  Profile,
  links,
  isTabActive = () => {},
  maxWidth = false,
  className,
}): ReactElement => (
  <Wrapper className={className}>
    <MuiContainer maxWidth={maxWidth}>
      <Inner>
        <NavLinks>
          {HomeButton}
          {links.map(({ label, to, isActive, icon, id }) => (
            <StyledTab
              isActive={isActive || isTabActive}
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
        <Profile />
      </Inner>
    </MuiContainer>
  </Wrapper>
);
