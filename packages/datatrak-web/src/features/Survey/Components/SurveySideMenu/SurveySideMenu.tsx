/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { To } from 'react-router';
import { useFormContext } from 'react-hook-form';
import { QuestionType } from '@tupaia/types';
import { Drawer as BaseDrawer, ListItem, List, ButtonProps } from '@material-ui/core';
import { useSurveyForm } from '../../SurveyContext';
import { SideMenuButton } from './SideMenuButton';
import { ButtonLink } from '../../../../components';
import { useIsMobile } from '../../../../utils';
import { getSurveyScreenNumber } from '../../utils';

export const SIDE_MENU_WIDTH = '20rem';

const Drawer = styled(BaseDrawer).attrs({
  anchor: 'left',
  elevation: 0,
})`
  flex-shrink: 0;
  position: relative;
  height: 100%;
  width: 100%;
  max-width: ${SIDE_MENU_WIDTH};
  .MuiPaper-root {
    width: 100%;
    position: absolute;
    border-right: none;
    height: 100%;
  }
  ${({ theme }) => theme.breakpoints.up('md')} {
    .MuiPaper-root {
      background-color: transparent;
    }
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
    $isInstructionOnly?: boolean;
  }
>`
  padding: 0.5rem;
  align-items: flex-start;
  justify-content: flex-start;
  overflow: hidden;
  background-color: ${({ theme, $active }) =>
    $active ? `${theme.palette.primary.main}55` : 'transparent'};
  & ~ & {
    margin-left: 0; // overwrite styles from elsewhere
  }
  &:hover {
    background-color: ${({ theme }) => `${theme.palette.grey[400]}4d`};
  }
  .MuiButton-label {
    > span:not(.MuiTouchRipple-root) {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      line-clamp: ${({ $isInstructionOnly }) => ($isInstructionOnly ? 1 : 2)};
      -webkit-line-clamp: ${({ $isInstructionOnly }) => ($isInstructionOnly ? 1 : 2)};
      overflow: hidden;
    }
  }
`;

const SurveyScreenNumber = styled.span`
  width: 2rem;
`;

const SurveyScreenTitle = styled.span`
  width: 100%;
  font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
`;

const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  button {
    border-radius: 3rem 0 0 3rem;
    position: static;
  }
  ${({ theme }) => theme.breakpoints.up('md')} {
    display: none;
  }
`;

export const SurveySideMenu = () => {
  const { getValues } = useFormContext();
  const isMobile = useIsMobile();
  const {
    sideMenuOpen,
    toggleSideMenu,
    visibleScreens,
    screenNumber,
    setFormData,
    isReviewScreen,
  } = useSurveyForm();
  if (isReviewScreen) return null;
  const onChangeScreen = () => {
    setFormData(getValues());
  };
  const getFormattedScreens = () => {
    const screens = visibleScreens?.map(screen => {
      const { surveyScreenComponents, id } = screen;
      const { text } = surveyScreenComponents[0];
      const screenNumber = getSurveyScreenNumber(visibleScreens, screen);
      return { id, text, screenNumber };
    });
    return screens;
  };
  const screenMenuItems = getFormattedScreens();
  return (
    <>
      <SideMenuButton />
      <Drawer
        open={sideMenuOpen}
        onClose={toggleSideMenu}
        variant={isMobile ? 'temporary' : 'persistent'}
      >
        <Header>
          <SideMenuButton />
        </Header>
        <SurveyMenuContent>
          {screenMenuItems?.map((screen, i) => {
            const num = i + 1;
            return (
              <SurveyMenuItem
                key={screen.id}
                to={`../${num}`}
                $active={screenNumber === num}
                onClick={onChangeScreen}
                $isInstructionOnly={!screen.screenNumber}
              >
                {screen.screenNumber && (
                  <SurveyScreenNumber>{screen.screenNumber}:</SurveyScreenNumber>
                )}
                <SurveyScreenTitle>{screen.text}</SurveyScreenTitle>
              </SurveyMenuItem>
            );
          })}
        </SurveyMenuContent>
      </Drawer>
    </>
  );
};
