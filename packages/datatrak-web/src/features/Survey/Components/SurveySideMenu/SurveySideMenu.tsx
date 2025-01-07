/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled, { css } from 'styled-components';
import { To, Link as RouterLink } from 'react-router-dom';
import { useFormContext } from 'react-hook-form';
import { Drawer as BaseDrawer, ListItem, List, ButtonProps } from '@material-ui/core';
import { useFromLocation, useIsMobile } from '../../../../utils';
import { getSurveyScreenNumber } from '../../utils';
import { useSurveyRouting } from '../../useSurveyRouting';
import { SideMenuButton } from './SideMenuButton';
import { useSurveyForm } from '../../SurveyContext';
import { StickyMobileHeader } from '../../../../layout';
import { SurveyDisplayName } from '../SurveyDisplayName';

export const SIDE_MENU_WIDTH = '20rem';

const Drawer = styled(BaseDrawer).attrs({
  anchor: 'left',
  elevation: 0,
})`
  flex-shrink: 0;
  position: relative;
  height: 100%;
  width: 100%;

  .MuiPaper-root {
    width: 100%;
    position: absolute;
    border-right: none;
    height: 100%;
  }

  ${({ theme }) => theme.breakpoints.up('md')} {
    max-width: ${SIDE_MENU_WIDTH};
    .MuiPaper-root {
      background-color: transparent;
    }
  }
`;

const SurveyMenuContent = styled(List)`
  padding: 0 0.5rem;
  ${({ theme }) => theme.breakpoints.down('md')} {
    padding: 0;
    border-top: 1px solid ${({ theme }) => theme.palette.divider};
  }
`;

const SurveyMenuItem = styled(ListItem).attrs({
  button: true,
  component: RouterLink,
  variant: 'text',
  color: 'default',
})<
  ButtonProps & {
    to: To;
    $active?: boolean;
    $isInstructionOnly?: boolean;
    state: {
      from?: string | undefined;
    };
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

  ${({ theme }) => theme.breakpoints.down('md')} {
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
    padding: 0.8rem;

    ${({ $active }) =>
      $active &&
      css`
        background-color: #f4f9ff;
      `}
    &:hover {
      background-color: initial;
    }
  }
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
  const from = useFromLocation();
  const isMobile = useIsMobile();
  const {
    sideMenuOpen,
    toggleSideMenu,
    visibleScreens,
    screenNumber,
    updateFormData,
    isReviewScreen,
    isSuccessScreen,
    isResponseScreen,
    numberOfScreens,
  } = useSurveyForm();
  if (isReviewScreen || isSuccessScreen || isResponseScreen) return null;
  const onChangeScreen = () => {
    updateFormData(getValues());
    if (isMobile) toggleSideMenu();
  };
  const getFormattedScreens = () => {
    const screens = visibleScreens?.map(screen => {
      const { surveyScreenComponents, id } = screen;
      const { text } = surveyScreenComponents[0];
      const surveyScreenNum = getSurveyScreenNumber(visibleScreens, screen);
      return { id, text, screenNumber: surveyScreenNum };
    });
    return screens;
  };
  const screenMenuItems = getFormattedScreens();

  const { getScreenPath } = useSurveyRouting(numberOfScreens);

  return (
    <>
      <SideMenuButton />
      <Drawer
        open={sideMenuOpen}
        onClose={toggleSideMenu}
        variant={isMobile ? 'temporary' : 'persistent'}
      >
        {isMobile && (
          <StickyMobileHeader onClose={toggleSideMenu}>
            <SurveyDisplayName />
          </StickyMobileHeader>
        )}
        <Header>
          <SideMenuButton />
        </Header>
        <SurveyMenuContent>
          {screenMenuItems?.map((screen, i) => {
            const num = i + 1;
            return (
              <li key={screen.id}>
                <SurveyMenuItem
                  state={{
                    ...(from && { from }),
                  }}
                  to={getScreenPath(num)}
                  $active={screenNumber === num}
                  onClick={onChangeScreen}
                  $isInstructionOnly={!screen.screenNumber}
                >
                  <SurveyScreenTitle>{screen.text}</SurveyScreenTitle>
                </SurveyMenuItem>
              </li>
            );
          })}
        </SurveyMenuContent>
      </Drawer>
    </>
  );
};
