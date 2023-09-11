/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { To } from 'react-router';
import { useFormContext } from 'react-hook-form';
import { Drawer as BaseDrawer, ListItem, List, ButtonProps } from '@material-ui/core';
import { useSurveyForm } from '../SurveyContext';
import { SideMenuButton } from './SideMenuButton';
import { ButtonLink } from '../../../components';

export const SIDE_MENU_WIDTH = '20rem';

const Drawer = styled(BaseDrawer).attrs({
  anchor: 'left',
  variant: 'persistent',
  elevation: 0,
})`
  flex-shrink: 0;
  width: ${SIDE_MENU_WIDTH};
  position: relative;
  height: 100%;
  .MuiPaper-root {
    width: 100%;
    position: absolute;
    background-color: transparent;
    border-right: none;
    height: 100%;
  }
`;

const SurveyMenuContent = styled(List)`
  padding: 0 0.5rem;
`;

const SurveyMenuItem = styled(ListItem).attrs({
  button: true,
  component: ButtonLink,
  variant: 'text',
  color: 'default',
})<
  ButtonProps & {
    to: To;
    $active?: boolean;
  }
>`
  padding: 0.5rem;
  align-items: flex-start;
  justify-content: flex-start;
  background-color: ${({ theme, $active }) =>
    $active ? `${theme.palette.primary.main}55` : 'transparent'};
  & ~ & {
    margin-left: 0; // overwrite styles from elsewhere
  }
  &:hover {
    background-color: ${({ theme }) => `${theme.palette.grey[400]}4d`};
  }
`;

const SurveyScreenNumber = styled.span`
  width: 2rem;
`;

const SurveyScreenTitle = styled.span`
  width: 100%;
  font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
`;

export const SurveySideMenu = () => {
  const { getValues } = useFormContext();
  const {
    sideMenuOpen,
    toggleSideMenu,
    surveyScreenComponents,
    screenNumber,
    setFormData,
    isReviewScreen,
  } = useSurveyForm();
  if (isReviewScreen) return null;
  const onChangeScreen = () => {
    setFormData(getValues());
  };
  return (
    <>
      <SideMenuButton />
      <Drawer open={sideMenuOpen} onClose={toggleSideMenu}>
        <SurveyMenuContent>
          {Object.entries(surveyScreenComponents!).map(([key, screen]) => (
            <SurveyMenuItem
              key={screen[0].questionId}
              to={`../${key}`}
              $active={screenNumber === Number(key)}
              onClick={onChangeScreen}
            >
              <SurveyScreenNumber>{key}:</SurveyScreenNumber>
              <SurveyScreenTitle>{screen[0].questionText}</SurveyScreenTitle>
            </SurveyMenuItem>
          ))}
        </SurveyMenuContent>
      </Drawer>
    </>
  );
};
