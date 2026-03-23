import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import MuiMenuIcon from '@material-ui/icons/Menu';
import { Typography } from '@material-ui/core';

import { IconButton } from '@tupaia/ui-components';

import { PageTitleBar, SurveyIcon, TopProgressBar } from '../../../components';
import { useEntityByCode, useSurvey } from '../../../api';
import { PopoverMenu } from '../../../layout/UserMenu/PopoverMenu';
import { useSurveyForm } from '../SurveyContext';
import { CopyUrlButton } from './CopyUrlButton';

const CountryName = styled.span`
  --leading-border-spacing: 0.3rem;
  border-inline-start: max(0.0625rem, 1px) solid currentcolor;
  font-weight: ${props => props.theme.typography.fontWeightRegular};
  margin-inline-start: var(--leading-border-spacing);
  padding-inline-start: var(--leading-border-spacing);
`;

const StyledCopyUrlButton = styled(CopyUrlButton)`
  margin-inline-start: 0.5rem;
`;

const TrailingActions = styled.div`
  display: flex;
  align-items: center;
`;

const MenuIcon = styled(MuiMenuIcon)`
  color: ${({ theme }) => theme.palette.text.primary};
  width: 2rem;
  height: 2rem;
`;

export const DesktopSurveyHeader = () => {
  const { surveyCode, screenNumber: screenNumberParam, countryCode } = useParams();
  const { screenNumber, numberOfScreens, isResponseScreen, isSuccessScreen, openCancelConfirmation } =
    useSurveyForm();
  const { data: survey } = useSurvey(surveyCode);
  const { data: country } = useEntityByCode(countryCode!);

  const [menuOpen, setMenuOpen] = useState(false);
  const onCloseMenu = () => setMenuOpen(false);
  const toggleUserMenu = () => setMenuOpen(!menuOpen);

  if (isResponseScreen) {
    return null;
  }

  const surveyGuard = isSuccessScreen ? undefined : openCancelConfirmation;

  const surveyName = survey?.name || '';
  const pageTitle = (
    <Typography variant="h1">
      {surveyName}
      {country?.name && <CountryName>{country?.name}</CountryName>}
    </Typography>
  );

  return (
    <PageTitleBar
      heading={pageTitle}
      isTransparent={!screenNumberParam}
      leadingIcon={<SurveyIcon color="primary" />}
      trailingIcon={
        <TrailingActions>
          <StyledCopyUrlButton />
          <IconButton
            onClick={toggleUserMenu}
            id="survey-menu-button"
            title="Toggle menu"
            disableRipple
          >
            <MenuIcon />
          </IconButton>
          <PopoverMenu anchorId="survey-menu-button" menuOpen={menuOpen} onCloseMenu={onCloseMenu} surveyGuard={surveyGuard} />
        </TrailingActions>
      }
    >
      {screenNumberParam && (
        <TopProgressBar
          currentSurveyQuestion={screenNumber}
          totalNumberOfSurveyQuestions={numberOfScreens}
        />
      )}
    </PageTitleBar>
  );
};
