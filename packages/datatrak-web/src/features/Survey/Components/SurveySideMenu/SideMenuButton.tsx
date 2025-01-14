import React from 'react';
import styled from 'styled-components';
import { FormatListBulleted, KeyboardArrowLeft } from '@material-ui/icons';
import { useSurveyForm } from '../../SurveyContext';
import { Button } from '../../../../components';

const MenuButton = styled(Button).attrs({
  variant: 'contained',
})`
  padding: 0.5rem 0.8rem 0.5rem 0.3rem;
  border-radius: 0 3rem 3rem 0;
  min-width: 0;
  background-color: ${({ theme }) => theme.palette.primary.dark};
  color: ${({ theme }) => theme.palette.background.paper};
  &:hover {
    background-color: ${({ theme }) => theme.palette.primary.dark};
    color: ${({ theme }) => theme.palette.background.paper};
  }
  ${({ theme }) => theme.breakpoints.down('sm')} {
    position: absolute;
    z-index: 1;
    margin-top: 0.5rem;
  }
`;

export const SideMenuButton = () => {
  const { toggleSideMenu, sideMenuOpen } = useSurveyForm();
  return (
    <MenuButton
      onClick={toggleSideMenu}
      tooltip={`${sideMenuOpen ? 'Close' : 'Expand'} survey contents`}
      aria-label="Toggle survey menu"
    >
      {sideMenuOpen ? <KeyboardArrowLeft /> : <FormatListBulleted />}
    </MenuButton>
  );
};
