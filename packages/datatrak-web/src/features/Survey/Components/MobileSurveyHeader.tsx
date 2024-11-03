/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useOutletContext, useParams } from 'react-router-dom';
import CloseIcon from '@material-ui/icons/Close';
import { Button, ArrowLeftIcon, TopProgressBar } from '../../../components';
import { useEntityByCode, useSurvey } from '../../../api';
import { useSurveyForm } from '../SurveyContext';
import { IconButton } from '@tupaia/ui-components';

const MOBILE_HEADER_HEIGHT = '4rem';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${MOBILE_HEADER_HEIGHT};

  .MuiSvgIcon-root {
    color: ${({ theme }) => theme.palette.text.primary};
  }
`;

const CountryName = styled.span`
  padding-left: 0.3rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
`;

const BackButton = styled(Button)`
  .MuiSvgIcon-root {
    font-size: 1rem;
  }
`;

const MobileTitle = styled.div`
  text-align: center;
  padding: 0 1rem;
  font-weight: 600;
`;

type SurveyLayoutContextT = {
  isLoading: boolean;
  onStepPrevious: () => void;
  hasBackButton: boolean;
};

export const MobileSurveyHeader = () => {
  const { screenNumber, numberOfScreens, isResponseScreen, openCancelConfirmation } =
    useSurveyForm();
  const { surveyCode, screenNumber: screenNumberParam, countryCode } = useParams();
  const { data: survey } = useSurvey(surveyCode);
  const { data: country } = useEntityByCode(countryCode!);
  const { onStepPrevious } = useOutletContext<SurveyLayoutContextT>();

  if (isResponseScreen) {
    return null;
  }

  const getDisplaySurveyName = () => {
    const maxSurveyNameLength = 50;
    if (!survey?.name) return '';

    const surveyName = survey.name;

    return surveyName.length > maxSurveyNameLength
      ? `${surveyName.slice(0, maxSurveyNameLength)}...`
      : surveyName;
  };
  const surveyName = getDisplaySurveyName();
  const countryName = country?.name || '';

  // Todo" Re-use Sticky header component
  return (
    <>
      <Container>
        <BackButton onClick={onStepPrevious} variant="text" title="Back">
          <ArrowLeftIcon />
        </BackButton>
        <MobileTitle>
          {surveyName}
          {<CountryName>| {countryName}</CountryName>}
        </MobileTitle>
        <IconButton onClick={openCancelConfirmation} title="Cancel">
          <CloseIcon />
        </IconButton>
      </Container>
      {screenNumberParam && (
        <TopProgressBar
          currentSurveyQuestion={screenNumber}
          totalNumberOfSurveyQuestions={numberOfScreens}
        />
      )}
    </>
  );
};
